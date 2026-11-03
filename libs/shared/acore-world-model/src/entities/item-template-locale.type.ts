import { TableRow } from '@keira/shared/constants';

export const ITEM_TEMPLATE_LOCALE_TABLE = 'item_template_locale';
export const ITEM_TEMPLATE_LOCALE_ID = 'ID';
export const ITEM_TEMPLATE_LOCALE_ID_2 = 'locale';

export class ItemTemplateLocale extends TableRow {
  ID: number = 0;
  locale: string = '';
  Name: string = '';
  Description: string = '';
  VerifiedBuild: number = 0;
}
