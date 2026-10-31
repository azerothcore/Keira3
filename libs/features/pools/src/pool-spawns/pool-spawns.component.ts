import { ChangeDetectionStrategy, Component, computed, Directive, effect, inject, untracked } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoolCreature, PoolGameobject } from '@keira/shared/acore-world-model';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { POOLED_GAMEOBJECT_TYPES, PoolProblem } from '../pool-checks';
import { PoolPlace, showInWorldEditor } from '../pool-links';
import { Lookup } from '../lookup';
import { PoolMembersComponent } from '../pool-members.component';
import { PoolCreatureService, PoolGameobjectService } from './pool-spawns.service';

/** A pooled spawn as the world has it (null: no such spawn). */
export interface PoolSpawnInfo extends PoolPlace {
  entry: number;
  name: string;
  /** The gameobject's type (-1 without a template). */
  objectType: number;
}

/**
 * The spawns of a pool (`pool_creature` / `pool_gameobject`): their chances, what the world server would refuse
 * (missing spawns, spawns on several maps, gameobjects that can't be pooled, spawns already in another pool), and a
 * way to see each in the World Editor.
 */
@Directive()
export abstract class PoolSpawnsComponent<T extends PoolCreature> extends PoolMembersComponent<T> {
  protected abstract readonly type: PoolPlace['type'];
  private readonly spawnLookup = new Lookup(
    (sql) => this.editorService.queryService.query<TableRow>(sql),
    (ids) => {
      const type = this.type;
      const objectType = type === 'gameobject' ? 'IFNULL(t.type, -1)' : '-1';
      return (
        `SELECT s.guid AS id, s.id AS entry, IFNULL(t.name, '') AS name, s.map, s.position_x AS x, s.position_y AS y, ` +
        `s.position_z AS z, ${objectType} AS objectType FROM ${type} s LEFT JOIN ${type}_template t ON t.entry = s.id ` +
        `WHERE s.guid IN (${ids})`
      );
    },
  );
  /** The other pools holding some of the spawns. */
  private readonly otherPools = new Lookup(
    (sql) => this.editorService.queryService.query<TableRow>(sql),
    (ids) =>
      `SELECT guid AS id, pool_entry FROM pool_${this.type} WHERE guid IN (${ids}) ` +
      `AND pool_entry <> ${Math.trunc(Number(this.handlerService.selected))}`,
  );

  constructor() {
    super();
    effect(() => {
      const guids = this.editorService.rows().map((row) => Number(row.guid));
      untracked(() => {
        this.keep(this.spawnLookup.need(guids), this.otherPools.need(guids));
      });
    });
  }

  protected readonly problems = computed<PoolProblem[]>(() => {
    const rows = this.editorService.rows();
    const problems = this.chanceChecks(rows.map((row) => Number(row.chance)));
    const missing = rows.filter((row) => this.spawnOf(row.guid) === null).map((row) => row.guid);
    if (missing.length) {
      problems.push({ key: 'MISSING_SPAWN', params: { guids: missing.join(', ') } });
    }
    const found = rows.map((row) => this.spawnOf(row.guid)).filter((spawn): spawn is PoolSpawnInfo => !!spawn);
    const maps = [...new Set(found.map((spawn) => spawn.map))];
    if (maps.length > 1) {
      problems.push({ key: 'MANY_MAPS', params: { maps: maps.join(', ') } });
    }
    const unpooled = found.filter((spawn) => this.type === 'gameobject' && !POOLED_GAMEOBJECT_TYPES.includes(spawn.objectType));
    if (unpooled.length) {
      problems.push({ key: 'NOT_POOLABLE', params: { guids: unpooled.map((spawn) => spawn.guid).join(', ') } });
    }
    const elsewhere = rows.filter((row) => this.otherPools.get(row.guid));
    if (elsewhere.length) {
      const list = elsewhere.map((row) => `${row.guid} (${this.otherPools.get(row.guid)?.['pool_entry']})`).join(', ');
      problems.push({ key: 'OTHER_POOL', params: { list } });
    }
    return problems;
  });

  /** A spawn's name and where it is (null: no such spawn; undefined: not read yet). */
  protected spawnOf(guid: number): PoolSpawnInfo | null | undefined {
    const row = this.spawnLookup.get(guid);
    if (!row) {
      return row;
    }
    const [id, entry, map, x, y, z, objectType] = ['id', 'entry', 'map', 'x', 'y', 'z', 'objectType'].map((key) => Number(row[key]));
    return { type: this.type, guid: id, entry, name: String(row['name']), map, x, y, z, objectType };
  }

  protected showIn3d(spawn: PoolSpawnInfo): void {
    showInWorldEditor(this.router, spawn);
  }
}

const IMPORTS = [
  TopBarComponent,
  TranslateDirective,
  TranslatePipe,
  QueryOutputComponent,
  FormsModule,
  ReactiveFormsModule,
  TooltipDirective,
  EditorButtonsComponent,
  NgxDatatableModule,
];

/** Pool Editor > creatures. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-pool-creature',
  templateUrl: './pool-spawns.component.html',
  imports: IMPORTS,
})
export class PoolCreatureComponent extends PoolSpawnsComponent<PoolCreature> {
  protected override readonly editorService = inject(PoolCreatureService);
  protected readonly type = 'creature';
}

/** Pool Editor > gameobjects. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-pool-gameobject',
  templateUrl: './pool-spawns.component.html',
  imports: IMPORTS,
})
export class PoolGameobjectComponent extends PoolSpawnsComponent<PoolGameobject> {
  protected override readonly editorService = inject(PoolGameobjectService);
  protected readonly type = 'gameobject';
}
