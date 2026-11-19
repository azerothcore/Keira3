import { TableRow } from '@keira/shared/constants';

export const CREATURE_TEXT_LOCALE_TABLE = 'creature_text_locale';
export const CREATURE_TEXT_LOCALE_ID = 'CreatureID';
export const CREATURE_TEXT_LOCALE_ID_2 = 'GroupID';
export const CREATURE_TEXT_LOCALE_ID_3 = 'ID';
export const CREATURE_TEXT_LOCALE_LOCALE = 'Locale';

export class CreatureTextLocale extends TableRow {
  CreatureID: number = 0;
  GroupID: number = 0;
  ID: number = 0;
  Locale: string = '';
  Text: string = '';
}
