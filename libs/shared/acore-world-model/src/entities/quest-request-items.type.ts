import { TableRow } from '@keira/shared/constants';

export const QUEST_REQUEST_ITEMS_TABLE = 'quest_request_items';
export const QUEST_REQUEST_ITEMS_ID = 'ID';

export class QuestRequestItems extends TableRow {
  ID: number = 0;
  EmoteOnComplete: number = 0;
  EmoteOnIncomplete: number = 0;
  CompletionText: string = '';
  VerifiedBuild: number = 0;
}
