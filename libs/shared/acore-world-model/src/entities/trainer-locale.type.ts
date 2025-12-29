import { TableRow } from '@keira/shared/constants';

export const TRAINER_LOCALE_TABLE = 'trainer_locale';
export const TRAINER_LOCALE_ID = 'Id';
export const TRAINER_LOCALE_ID_2 = 'locale';

export class TrainerLocale extends TableRow {
  Id: number = 0;
  locale: string = '';
  Greeting_lang: string = '';
  VerifiedBuild: number = 0;
}
