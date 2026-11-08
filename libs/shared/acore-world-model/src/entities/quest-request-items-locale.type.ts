import { TableRow } from '@keira/shared/constants';

export const QUEST_REQUEST_ITEMS_LOCALE_TABLE = 'quest_request_items_locale';
export const QUEST_REQUEST_ITEMS_LOCALE_ID = 'ID';
export const QUEST_REQUEST_ITEMS_LOCALE_ID_2 = 'locale';

export class QuestRequestItemsLocale extends TableRow {
  ID: number = 0;
  locale: string = '';
  CompletionText: string = '';
  VerifiedBuild: number = 0;
}
