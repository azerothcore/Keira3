import { Service, inject } from '@angular/core';
import {
  CREATURE_FORMATIONS_LEADER_GUID,
  CREATURE_FORMATIONS_MEMBER_GUID,
  CREATURE_FORMATIONS_TABLE,
  CreatureFormation,
  CREATURE_SPAWN_ID,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { map, Observable, of } from 'rxjs';
import { CreatureHandlerService } from '../creature-handler.service';

/** A spawn of the creature edited, and its place in formations. */
export interface FormationSpawn {
  guid: number;
  map: number;
  /** How many members it leads. */
  leads: number;
  /** The leader of the formation it's a member of (null: none). */
  ledBy: number | null;
}

/**
 * The formation (`creature_formations`) of a spawn of the creature edited: a formation is a leader spawn (its guid)
 * and its members, not the creature's entry. The leader edited is one of the creature's spawns, or the leader of the
 * formation one of them is in.
 */
@Service()
export class CreatureFormationsService extends MultiRowEditorService<CreatureFormation> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureFormation;
  protected override readonly _entityTable = CREATURE_FORMATIONS_TABLE;
  protected override readonly _entityIdField = CREATURE_FORMATIONS_LEADER_GUID;
  protected override readonly _entitySecondIdField = CREATURE_FORMATIONS_MEMBER_GUID;
  /** The leader spawn (guid) whose formation is edited (undefined: none picked). */
  protected _leader: number | undefined = undefined;

  get leader(): number | undefined {
    return this._leader;
  }

  constructor() {
    super();
    this.init();
  }

  /** Edits another leader's formation (read again by the editor). */
  setLeader(leader: number | undefined): void {
    this._leader = leader;
    this._loadedEntityId = undefined;
  }

  /** The creature's spawns (`creature.id`), with the formations they lead or are in. */
  getSpawns(entry: string | number): Observable<FormationSpawn[]> {
    return this.queryService
      .query<TableRow>(
        'SELECT `c`.`guid`, `c`.`map`, ' +
          '(SELECT COUNT(*) FROM `creature_formations` `f` WHERE `f`.`leaderGUID` = `c`.`guid` AND `f`.`memberGUID` <> `c`.`guid`) AS `leads`, ' +
          '(SELECT `f`.`leaderGUID` FROM `creature_formations` `f` WHERE `f`.`memberGUID` = `c`.`guid` AND `f`.`leaderGUID` <> `c`.`guid` LIMIT 1) AS `ledBy` ' +
          `FROM \`creature\` \`c\` WHERE \`c\`.\`${CREATURE_SPAWN_ID}\` = ${Math.trunc(Number(entry))} ORDER BY \`c\`.\`guid\` LIMIT 500`,
      )
      .pipe(
        map((rows) =>
          (rows ?? []).map((row) => ({
            guid: Number(row['guid']),
            map: Number(row['map']),
            leads: Number(row['leads']),
            ledBy: row['ledBy'] === null || row['ledBy'] === undefined ? null : Number(row['ledBy']),
          })),
        ),
      );
  }

  /** The rows of the leader's formation (none without a leader). */
  protected override selectQuery(): Observable<CreatureFormation[]> {
    return this._leader === undefined
      ? of([])
      : this.queryService.selectAll<CreatureFormation>(this._entityTable, this._entityIdField as string, this._leader);
  }

  /** A new row is in the leader's formation (not the creature's entry). */
  protected override addIdToNewRow(newRow: CreatureFormation): void {
    newRow.leaderGUID = this._leader ?? 0;
  }
}
