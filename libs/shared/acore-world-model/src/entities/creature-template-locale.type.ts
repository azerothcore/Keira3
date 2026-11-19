import { TableRow } from '@keira/shared/constants';

export const CREATURE_TEMPLATE_LOCALE_TABLE = 'creature_template_locale';
export const CREATURE_TEMPLATE_LOCALE_ID = 'entry';
export const CREATURE_TEMPLATE_LOCALE_ID_2 = 'locale';

export class CreatureTemplateLocale extends TableRow {
  entry: number = 0;
  locale: string = '';
  Name: string = '';
  Title: string = '';
  VerifiedBuild: number = 0;
}
