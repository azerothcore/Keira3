import { TableRow } from '@keira/shared/constants';

export const ACORE_STRING_TABLE = 'acore_string';

export const ACORE_STRING_ENTRY = 'entry';
export const ACORE_STRING_DEFAULT = 'content_default';
export const ACORE_STRING_SEARCH_FIELDS = [ACORE_STRING_ENTRY, ACORE_STRING_DEFAULT];

export const ACORE_STRING_CUSTOM_STARTING_ID = 90_000;

export class AcoreString extends TableRow {
  entry: number = 0;
  content_default: string = '';
  locale_koKR: string = '';
  locale_frFR: string = '';
  locale_deDE: string = '';
  locale_zhCN: string = '';
  locale_zhTW: string = '';
  locale_esES: string = '';
  locale_esMX: string = '';
  locale_ruRU: string = '';
}
