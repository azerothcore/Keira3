import { TableRow } from '../../../shared-constants/src/types/general';

export const CREATURE_TEMPLATE_MOVEMENT_TABLE = 'creature_template_movement';
export const CREATURE_TEMPLATE_MOVEMENT_ID = 'CreatureId';

export class CreatureTemplateMovement extends TableRow {
  CreatureId: number = 0;
  Ground: number = 0;
  Swim: number = 0;
  Flight: number = 0;
  Rooted: number = 0;
  Chase: number = 0;
  Random: number = 0;
  InteractionPauseTimer: number = 0;
}
