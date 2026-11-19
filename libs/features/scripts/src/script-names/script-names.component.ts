import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableRow, WORLD_EDITOR_LINKS } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ScriptName, scriptGithubUrl, WowClientService } from '@keira/shared/wow-data';
import { ElectronService } from '@keira/shared/common-services';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { sourceFolderSet } from '../source-folder';
import { TableSort } from '../table-sort';

/** A row of the database naming a script (`ScriptName` and the like). */
export interface ScriptUser {
  /** The table it's in, as a kind: creature, gameobject, item, areatrigger, spell, instance, creature spawn… */
  kind: string;
  id: number;
  name: string;
  scriptName: string;
}

/** A script listed, with the rows using it. */
interface ScriptRow {
  name: string;
  kind: string;
  file: string;
  line?: number;
  path?: string;
  users: ScriptUser[];
}

/** The tables naming scripts: their kind and how to read them (`id`, `name`, `scriptName`). */
const USER_QUERIES: [string, string][] = [
  ['creature', "SELECT entry AS id, name, ScriptName AS scriptName FROM creature_template WHERE ScriptName <> ''"],
  ['gameobject', "SELECT entry AS id, name, ScriptName AS scriptName FROM gameobject_template WHERE ScriptName <> ''"],
  ['item', "SELECT entry AS id, name, ScriptName AS scriptName FROM item_template WHERE ScriptName <> ''"],
  ['areatrigger', "SELECT entry AS id, '' AS name, ScriptName AS scriptName FROM areatrigger_scripts"],
  ['spell', "SELECT spell_id AS id, '' AS name, ScriptName AS scriptName FROM spell_script_names"],
  ['instance', "SELECT map AS id, '' AS name, script AS scriptName FROM instance_template WHERE script <> ''"],
  ['creature spawn', "SELECT guid AS id, '' AS name, ScriptName AS scriptName FROM creature WHERE ScriptName <> ''"],
  ['gameobject spawn', "SELECT guid AS id, '' AS name, ScriptName AS scriptName FROM gameobject WHERE ScriptName <> ''"],
  ['outdoorpvp', "SELECT TypeId AS id, comment AS name, ScriptName AS scriptName FROM outdoorpvp_template WHERE ScriptName <> ''"],
  ['achievement', "SELECT criteria_id AS id, '' AS name, ScriptName AS scriptName FROM achievement_criteria_data WHERE ScriptName <> ''"],
  ['condition', "SELECT SourceEntry AS id, Comment AS name, ScriptName AS scriptName FROM conditions WHERE ScriptName <> ''"],
  ['transport', "SELECT entry AS id, name, ScriptName AS scriptName FROM transports WHERE ScriptName <> ''"],
  ['weather', "SELECT zone AS id, '' AS name, ScriptName AS scriptName FROM game_weather WHERE ScriptName <> ''"],
  ['battleground', "SELECT ID AS id, Comment AS name, ScriptName AS scriptName FROM battleground_template WHERE ScriptName <> ''"],
];

/** Scripts no table names (GM commands, player and server hooks): never "used by nothing". */
const NOT_NAMED_IN_DB = new Set(['command', 'other']);

/** How many rows are listed at once (the filter narrows them down). */
export const SCRIPT_NAMES_SHOWN = 200;

/**
 * Script names: the scripts the AzerothCore source registers, what in the database uses each, the ones nothing uses,
 * and the names the database uses that no script registers (the world server warns about those).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-script-names',
  templateUrl: './script-names.component.html',
  imports: [TranslatePipe, RouterLink],
})
export class ScriptNamesComponent implements OnInit {
  private readonly client = inject(WowClientService);
  private readonly queryService = inject(MysqlQueryService);
  protected readonly links = inject(WORLD_EDITOR_LINKS, { optional: true });
  protected readonly hasSource = sourceFolderSet();
  /** The scripts of the source (undefined while they're read). */
  protected readonly names = signal<ScriptName[] | undefined>(undefined);
  protected readonly error = signal('');
  protected readonly users = signal<ScriptUser[]>([]);
  protected readonly filter = signal('');
  protected readonly kind = signal('');
  protected readonly show = signal<'all' | 'unused' | 'missing'>('all');
  protected readonly expanded = signal<string | undefined>(undefined);
  protected readonly SHOWN = SCRIPT_NAMES_SHOWN;
  protected readonly githubUrl = scriptGithubUrl;
  private readonly electron = inject(ElectronService);
  /** Whether a file can be opened on this computer (the desktop app). */
  protected canOpenFiles(): boolean {
    return !!this.electron.isElectron();
  }
  protected readonly sort = new TableSort<ScriptRow>({
    name: (row) => row.name,
    kind: (row) => row.kind,
    file: (row) => row.file,
    users: (row) => row.users.length,
  });
  protected readonly sorted = computed(() => this.sort.apply(this.rows()));

  /** The database rows using each script name. */
  private readonly usersByName = computed(() => {
    const byName = new Map<string, ScriptUser[]>();
    for (const user of this.users()) {
      byName.set(user.scriptName, [...(byName.get(user.scriptName) ?? []), user]);
    }
    return byName;
  });
  // (these are only read once the names are read)
  protected readonly kinds = computed(() => [...new Set((this.names() as ScriptName[]).map((name) => name.kind))].sort());

  /** The scripts listed (by the filter and the kind), with how many rows use each. */
  protected readonly rows = computed(() => {
    const text = this.filter().trim().toLowerCase();
    const kind = this.kind();
    const byName = this.usersByName();
    if (this.show() === 'missing') {
      const known = new Set((this.names() as ScriptName[]).map((name) => name.name));
      return [...byName.entries()]
        .filter(([name]) => !known.has(name) && name.toLowerCase().includes(text))
        .map(([name, users]) => ({ name, kind: users[0].kind, file: '', users }))
        .filter((row) => !kind || row.kind === kind);
    }
    return (this.names() as ScriptName[])
      .filter((name) => (!kind || name.kind === kind) && (name.name.toLowerCase().includes(text) || name.file.toLowerCase().includes(text)))
      .map((name) => ({ ...name, users: byName.get(name.name) ?? [] }))
      .filter((row) => this.show() === 'all' || (!row.users.length && !NOT_NAMED_IN_DB.has(row.kind)));
  });

  ngOnInit(): void {
    if (!this.hasSource()) {
      return;
    }
    this.client.getScriptNames().then(
      (names) => this.names.set(names),
      (error: Error) => {
        this.names.set([]);
        this.error.set(error.message);
      },
    );
    forkJoin(
      USER_QUERIES.map(([kind, sql]) =>
        this.queryService.query<TableRow>(sql).pipe(
          map((rows) =>
            (rows ?? []).map((row) => ({
              kind,
              id: Number(row['id']),
              name: String(row['name'] ?? ''),
              scriptName: String(row['scriptName']),
            })),
          ),
          // (a table missing from this database)
          catchError(() => of([] as ScriptUser[])),
        ),
      ),
    ).subscribe((lists) => this.users.set(lists.flat()));
  }

  protected setFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected setKind(event: Event): void {
    this.kind.set((event.target as HTMLSelectElement).value);
  }

  protected setShow(event: Event): void {
    this.show.set((event.target as HTMLSelectElement).value as 'all' | 'unused' | 'missing');
  }

  /** Opens a script's file in the program set for it on this computer. */
  protected openFile(path: string): void {
    void this.electron.openPath(path);
  }

  protected toggle(name: string): void {
    this.expanded.set(this.expanded() === name ? undefined : name);
  }

  /** Opens a creature or gameobject using the script in its editor. */
  protected open(user: ScriptUser): void {
    if (user.kind === 'creature') {
      this.links?.openCreature(user.id, user.name);
    } else {
      this.links?.openGameObject(user.id, user.name);
    }
  }
}
