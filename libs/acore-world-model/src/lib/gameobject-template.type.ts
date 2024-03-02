import { TableRow } from './general';

export const GAMEOBJECT_TEMPLATE_TABLE = 'gameobject_template';
export const GAMEOBJECT_TEMPLATE_ID = 'entry';
export const GAMEOBJECT_TEMPLATE_NAME = 'name';
export const GAMEOBJECT_TEMPLATE_CUSTOM_STARTING_ID = 900_000;
export const GAMEOBJECT_TEMPLATE_SEARCH_FIELDS = [GAMEOBJECT_TEMPLATE_ID, GAMEOBJECT_TEMPLATE_NAME, 'ScriptName'];

export const GAMEOBJECT_TEMPLATE_LOOT_ID = 'Data1';
export const GAMEOBJECT_TEMPLATE_TYPE = 'type';

export class GameobjectTemplate extends TableRow {
  entry: number = 0;
  type: number = 0;
  displayId: number = 0;
  name: string = '';
  IconName: string = '';
  castBarCaption: string = '';
  unk1: string = '';
  size: number = 1;
  Data0: number = 0;
  Data1: number = 0;
  Data2: number = 0;
  Data3: number = 0;
  Data4: number = 0;
  Data5: number = 0;
  Data6: number = 0;
  Data7: number = 0;
  Data8: number = 0;
  Data9: number = 0;
  Data10: number = 0;
  Data11: number = 0;
  Data12: number = 0;
  Data13: number = 0;
  Data14: number = 0;
  Data15: number = 0;
  Data16: number = 0;
  Data17: number = 0;
  Data18: number = 0;
  Data19: number = 0;
  Data20: number = 0;
  Data21: number = 0;
  Data22: number = 0;
  Data23: number = 0;
  AIName: string = '';
  ScriptName: string = '';
  VerifiedBuild: number = 0;
}
