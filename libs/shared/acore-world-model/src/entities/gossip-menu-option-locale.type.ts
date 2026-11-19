import { TableRow } from '@keira/shared/constants';

export const GOSSIP_MENU_OPTION_LOCALE_TABLE = 'gossip_menu_option_locale';
export const GOSSIP_MENU_OPTION_LOCALE_ID = 'MenuID';
export const GOSSIP_MENU_OPTION_LOCALE_ID_2 = 'OptionID';
export const GOSSIP_MENU_OPTION_LOCALE_ID_3 = 'Locale';

export class GossipMenuOptionLocale extends TableRow {
  MenuID: number = 0;
  OptionID: number = 0;
  Locale: string = '';
  OptionText: string = '';
  BoxText: string = '';
}
