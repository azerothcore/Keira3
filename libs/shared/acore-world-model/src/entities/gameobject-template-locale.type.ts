import { TableRow } from '@keira/shared/constants';

export const GAMEOBJECT_TEMPLATE_LOCALE_TABLE = 'gameobject_template_locale';
export const GAMEOBJECT_TEMPLATE_LOCALE_ID = 'entry';
export const GAMEOBJECT_TEMPLATE_LOCALE_ID_2 = 'locale';

export class GameobjectTemplateLocale extends TableRow {
  entry: number = 0;
  locale: string = '';
  name: string = '';
  castBarCaption: string = '';
  VerifiedBuild: number = 0;
}
