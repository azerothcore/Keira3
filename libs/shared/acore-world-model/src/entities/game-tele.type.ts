import { TableRow } from '@keira/shared/constants';

export const GAME_TELE_CUSTOM_STARTING_ID = 10_000;
export const GAME_TELE_TABLE = 'game_tele';
export const GAME_TELE_ID = 'id';
export const GAME_TELE_NAME = 'name';
export const GAME_TELE_SEARCH_FIELDS = ['id', 'name', 'map'];

export class GameTele extends TableRow {
  id: number = 0;
  position_x: number = 0;
  position_y: number = 0;
  position_z: number = 0;
  orientation: number = 0;
  map: number = 0;
  name: string = '';
}
