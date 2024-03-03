import { TableRow } from './general';

export interface QuestReputationReward extends TableRow {
  faction: number;
  quest_rate: number;
  quest_daily_rate: number;
  quest_weekly_rate: number;
  quest_monthly_rate: number;
  quest_repeatable_rate: number;
  creature_rate: number;
  spell_rate: number;
}
