import { TableRow } from '@keira/shared/constants';

export const CREATURE_TEXT_TABLE = 'creature_text';
export const CREATURE_ID = 'CreatureID';
export const TEXT_ID = 'ID';

export class CreatureText extends TableRow {
  CreatureID: number = 0;
  GroupID: number = 0;
  ID: number = 0;
  Text: string = '';
  Type: number = 0;
  Language: number = 0;
  Probability: number = 0;
  Emote: number = 0;
  Duration: number = 0;
  Sound: number = 0;
  BroadcastTextId: number = 0;
  TextRange: number = 0;
  comment: string = '';
}
