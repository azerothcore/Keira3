import { TableRow } from '@keira/shared/constants';

export const BROADCAST_TEXT_LOCALE_TABLE = 'broadcast_text_locale';
export const BROADCAST_TEXT_LOCALE_ID = 'ID';
export const BROADCAST_TEXT_LOCALE_ID_2 = 'locale';

export class BroadcastTextLocale extends TableRow {
  ID: number = 0;
  locale: string = '';
  MaleText: string = '';
  FemaleText: string = '';
  VerifiedBuild: number = 0;
}
