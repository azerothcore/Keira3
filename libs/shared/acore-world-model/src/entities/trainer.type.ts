import { TableRow } from '@keira/shared/constants';

export const TRAINER_TABLE = 'trainer';
export const TRAINER_ID = 'Id';

export class Trainer extends TableRow {
  Id: number = 0;
  Type: number = 0;
  Requirement: number = 0;
  Greeting: string = '';
  VerifiedBuild: number = 0;
}
