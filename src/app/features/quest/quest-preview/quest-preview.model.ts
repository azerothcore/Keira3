import { TableRow } from '@keira-shared/types/general';

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

export class QuestReputationReward extends TableRow {
  faction: number = 1;
  quest_rate: number = 1;
  quest_daily_rate: number = 1;
  quest_weekly_rate: number = 1;
  quest_monthly_rate: number = 1;
  quest_repeatable_rate: number = 1;
  creature_rate: number = 1;
  spell_rate: number = 1;
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
