import { TableRow } from '@keira/shared/constants';

export const GOSSIP_MENU_OPTION_TABLE = 'gossip_menu_option';
export const GOSSIP_MENU_OPTION_ID = 'MenuID';
export const GOSSIP_MENU_OPTION_ID_2 = 'OptionID';

export class GossipMenuOption extends TableRow {
  MenuID: number = 0;
  OptionID: number = 0;
  OptionIcon: number = 0;
  OptionText: string = '';
  OptionBroadcastTextID: number = 0;
  OptionType: number = 0;
  OptionNpcFlag: number = 0;
  ActionMenuID: number = 0;
  ActionPoiID: number = 0;
  BoxCoded: number = 0;
  BoxMoney: number = 0;
  BoxText: string = '';
  BoxBroadcastTextID: number = 0;
  VerifiedBuild: number = 0;
}
