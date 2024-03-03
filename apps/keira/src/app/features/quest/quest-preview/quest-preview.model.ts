import { TableRow } from '@keira/shared-constants';

export interface Quest {
  id: number;
  title: string;
}

export interface DifficultyLevel {
  red?: number;
  orange?: number;
  yellow?: number;
  green?: number;
  grey?: number;
}

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

export const QUEST_FACTION_REWARD = {
  0: 0,
  1: 10,
  2: 25,
  3: 75,
  4: 150,
  5: 250,
  6: 350,
  7: 500,
  8: 1000,
  9: 5,
};
