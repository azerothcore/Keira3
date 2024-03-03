import { TableRow } from '../../../keira-shared-constants/src/types/general';

export const QUEST_OFFER_REWARD_TABLE = 'quest_offer_reward';
export const QUEST_OFFER_REWARD_ID = 'ID';

export class QuestOfferReward extends TableRow {
  ID: number = 0;
  Emote1: number = 0;
  Emote2: number = 0;
  Emote3: number = 0;
  Emote4: number = 0;
  EmoteDelay1: number = 0;
  EmoteDelay2: number = 0;
  EmoteDelay3: number = 0;
  EmoteDelay4: number = 0;
  RewardText: string = '';
  VerifiedBuild: number = 0;
}
