import { TableRow } from '@keira/shared/constants';

export const CREATURE_TEXT_TABLE = 'creature_text';
export const CREATURE_ID = 'CreatureID';
export const TEXT_ID = 'GroupID';
export const EXTRA_ID = 'ID';

export class CreatureText extends TableRow {
  CreatureID: number = 0;
  GroupID: number = 0;
  ID: number = 0;
  Text: string = '';
  // 12 = Say: 0 is not a valid chat type, see TEXT_TYPE
  Type: number = 12;
  Language: number = 0;
  // the core uses this as a weighted-random weight, so 0 would make the text unreachable
  Probability: number = 100;
  Emote: number = 0;
  Duration: number = 0;
  Sound: number = 0;
  BroadcastTextId: number = 0;
  TextRange: number = 0;
  comment: string = '';
}
