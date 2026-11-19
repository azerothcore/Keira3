import { TableRow } from '@keira/shared/constants';

export const PAGE_TEXT_LOCALE_TABLE = 'page_text_locale';
export const PAGE_TEXT_LOCALE_ID = 'ID';
export const PAGE_TEXT_LOCALE_ID_2 = 'locale';

export class PageTextLocale extends TableRow {
  ID: number = 0;
  locale: string = '';
  Text: string = '';
  VerifiedBuild: number = 0;
}
