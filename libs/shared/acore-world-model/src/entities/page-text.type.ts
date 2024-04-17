import { TableRow } from '@keira/shared/constants';

export const PAGE_TEXT_TABLE = 'page_text';
export const PAGE_TEXT_ID = 'ID';
export const PAGE_TEXT_NAME = 'text';

export const PAGE_TEXT_CUSTOM_STARTING_ID = 9_000;

export const PAGE_TEXT_SEARCH_FIELDS = [PAGE_TEXT_ID, PAGE_TEXT_NAME, 'NextPageId', 'VerifiedBuild'];

export class PageText extends TableRow {
  ID: number = 0;
  Text: string = '';
  NextPageID: number = 0;
  VerifiedBuild: number = 0;
}
