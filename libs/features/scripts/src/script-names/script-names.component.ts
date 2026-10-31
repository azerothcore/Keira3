import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableRow, WORLD_EDITOR_LINKS } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ScriptName, WowClientService } from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { sourceFolderSet } from '../source-folder';

/** A row of the database naming a script (`ScriptName` and the like). */
export interface ScriptUser {
  /** The table it's in, as a kind: creature, gameobject, item, areatrigger, spell, instance, creature spawn… */
  kind: string;
  id: number;
  name: string;
  scriptName: string;
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
];

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
      .filter((row) => this.show() === 'all' || !row.users.length);
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
