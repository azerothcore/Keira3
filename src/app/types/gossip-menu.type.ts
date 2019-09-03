import { TableRow } from './general';

export const GOSSIP_MENU_TABLE = 'gossip_menu';
export const GOSSIP_MENU_ID = 'MenuID';
export const GOSSIP_MENU_ID_2 = 'TextID';
export const GOSSIP_MENU_SEARCH_FIELDS = [
  GOSSIP_MENU_ID,
  GOSSIP_MENU_ID_2,
];

export class GossipMenu extends TableRow {
  MenuID: number = 0;
  TextID: number = 0;
}
