import { TableRow } from './general';

export const GOSSIP_MENU_TABLE = 'gossip_menu';
export const GOSSIP_MENU_ID = 'MenuID';
export const GOSSIP_MENU_ID_2 = 'TextID';
export const NPC_TEXT_0 = 'text0_0';
export const NPC_TEXT_1 = 'text0_1';
export const GOSSIP_MENU_SEARCH_FIELDS = [GOSSIP_MENU_ID, GOSSIP_MENU_ID_2, NPC_TEXT_0, NPC_TEXT_1];
export const GOSSIP_MENU_CUSTOM_STARTING_ID = 62_000;

export class GossipMenu extends TableRow {
  MenuID: number = 0;
  TextID: number = 0;
}
