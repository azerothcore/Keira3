import { TableRow } from '@keira/shared/constants';

export const PAGE_TEXT_TABLE = 'page_text';
export const PAGE_TEXT_ID = 'ID';
export const PAGE_TEXT_NAME = 'text';

export class PageText extends TableRow {
  ID: number = 0;
  Text: string = '';
  NextPageID: number = 0;
  VerifiedBuild: number = 0;
}
