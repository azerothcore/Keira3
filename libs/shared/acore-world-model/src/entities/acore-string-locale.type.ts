import { TableRow } from '@keira/shared/constants';

export const ACORE_STRING_LOCALE_TABLE = 'acore_string_locale';
export const ACORE_STRING_LOCALE_ID = 'entry';
export const ACORE_STRING_LOCALE_ID_2 = 'locale';

export class AcoreStringLocale extends TableRow {
  entry: number = 0;
  locale: string = '';
  content: string = '';
}
