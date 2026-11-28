import { TableRow } from '@keira/shared/constants';

export const QUEST_OFFER_REWARD_LOCALE_TABLE = 'quest_offer_reward_locale';
export const QUEST_OFFER_REWARD_LOCALE_ID = 'ID';
export const QUEST_OFFER_REWARD_LOCALE_ID_2 = 'locale';

export class QuestOfferRewardLocale extends TableRow {
  ID: number = 0;
  locale: string = '';
  RewardText: string = '';
  VerifiedBuild: number = 0;
}
