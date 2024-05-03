import { TableRow } from '@keira/shared/constants';

export const BROADCAST_TEXT_TABLE = 'broadcast_text';

export const BROADCAST_TEXT_ID = 'ID';
export const BROADCAST_TEXT_NAME = 'MaleText';
export const BROADCAST_TEXT_SEARCH_FIELDS = [BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, 'FemaleText', 'LanguageID'];

export const BROADCAST_TEXT_CUSTOM_STARTING_ID = 90_000;

export class BroadcastText extends TableRow {
  ID: number = 0;
  LanguageID: number = 0;
  MaleText: string = '';
  FemaleText: string = '';
  EmoteID1: number = 0;
  EmoteID2: number = 0;
  EmoteID3: number = 0;
  EmoteDelay1: number = 0;
  EmoteDelay2: number = 0;
  EmoteDelay3: number = 0;
  SoundEntriesId: number = 0;
  EmotesID: number = 0;
  Flags: number = 0;
  VerifiedBuild: number = 0;
}
