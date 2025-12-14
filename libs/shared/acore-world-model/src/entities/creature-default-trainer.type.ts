import { TableRow } from '@keira/shared/constants';

export const CREATURE_DEFAULT_TRAINER_TABLE = 'creature_default_trainer';
export const CREATURE_DEFAULT_TRAINER_ID = 'CreatureId';

export class CreatureDefaultTrainer extends TableRow {
  CreatureId: number = 0;
  TrainerId: number = 0;
}
