import { TableRow } from '@keira/shared/constants';

export const GAME_TELE_TABLE = 'game_tele';
export const GAME_TELE_ID = 'id';
export const GAME_TELE_SEARCH_FIELDS = ['id', 'name'];

export class GameTele extends TableRow {
  id: number = 0;
  position_x: number = 0;
  position_y: number = 0;
  position_z: number = 0;
  map: number = 0;
  name: string = '';
}
