import { TableRow } from '@keira/shared/constants';

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
