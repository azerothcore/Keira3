import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ScriptSpawn, WowClientService } from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';

import { sourceFolderSet } from '../source-folder';
import { TableSort } from '../table-sort';

/**
 * Scripted spawns: the gameobjects the core's scripts spawn themselves (battleground flags, banners and doors,
 * Wintergrasp's walls and towers, outdoor PvP capture points), not in the `gameobject` table: their entry and name,
 * map, file, and a way to see each in the World Editor.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-script-spawns',
  templateUrl: './script-spawns.component.html',
  imports: [TranslatePipe, RouterLink],
})
export class ScriptSpawnsComponent implements OnInit {
  private readonly client = inject(WowClientService);
  private readonly queryService = inject(MysqlQueryService);
  private readonly router = inject(Router);
  protected readonly hasSource = sourceFolderSet();
  protected readonly spawns = signal<ScriptSpawn[] | undefined>(undefined);
  protected readonly names = signal(new Map<number, string>());
  protected readonly error = signal('');
  protected readonly filter = signal('');

  protected readonly sort = new TableSort<ScriptSpawn>({
    entry: (spawn) => spawn.entry,
    name: (spawn) => this.names().get(spawn.entry) as string,
    map: (spawn) => spawn.mapId,
    file: (spawn) => spawn.file,
  });
  protected readonly sorted = computed(() => this.sort.apply(this.shown()));

  /** The spawns listed: only gameobjects (the database tells), by the filter. */
  protected readonly shown = computed(() => {
    const text = this.filter().trim().toLowerCase();
    const names = this.names();
    // (only read once they're read)
    return (this.spawns() as ScriptSpawn[]).filter(
      (spawn) =>
        names.has(spawn.entry) &&
        [String(spawn.entry), names.get(spawn.entry) as string, spawn.file, String(spawn.mapId)].some((value) =>
          value.toLowerCase().includes(text),
        ),
    );
  });

  ngOnInit(): void {
    if (!this.hasSource()) {
      return;
    }
    this.client.getAllScriptSpawns().then(
      (spawns) => {
        this.spawns.set(spawns);
        const entries = [...new Set(spawns.map((spawn) => spawn.entry))];
        if (entries.length) {
          this.queryService
            .query<TableRow>(`SELECT entry, name FROM gameobject_template WHERE entry IN (${entries.join(', ')})`)
            .subscribe({
              next: (rows) => this.names.set(new Map((rows ?? []).map((row) => [Number(row['entry']), String(row['name'])]))),
              error: (error: Error) => this.error.set(error.message),
            });
        }
      },
      (error: Error) => {
        this.spawns.set([]);
        this.error.set(error.message);
      },
    );
  }

  protected setFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected name(entry: number): string {
    return this.names().get(entry) as string;
  }

  protected showIn3d(spawn: ScriptSpawn): void {
    void this.router.navigate(['world-editor'], { queryParams: { map: spawn.mapId, x: spawn.x, y: spawn.y, z: spawn.z } });
  }
}
