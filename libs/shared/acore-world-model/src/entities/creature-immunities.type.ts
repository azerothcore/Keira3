import { TableRow } from '@keira/shared/constants';

export const CREATURE_IMMUNITIES_TABLE = 'creature_immunities';
export const CREATURE_IMMUNITIES_ID = 'ID';
// In 'min' next-id mode this is the id proposed when the table has no rows (see MysqlQueryService.getMinId).
export const CREATURE_IMMUNITIES_CUSTOM_STARTING_ID = -1;

export class CreatureImmunities extends TableRow {
  ID: number = 0;
  SchoolMask: number = 0;
  DispelTypeMask: number = 0;
  MechanicsMask: number = 0;
  Effects: string = '';
  Auras: string = '';
  ImmuneAoE: number = 0;
  ImmuneChain: number = 0;
  Comment: string = '';
}
