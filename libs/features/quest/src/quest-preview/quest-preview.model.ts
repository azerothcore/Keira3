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

export type QuestFactionRewardType = typeof QUEST_FACTION_REWARD;
export type QuestFactionRewardKey = keyof QuestFactionRewardType;
export type QuestFactionRewardValue = QuestFactionRewardType[QuestFactionRewardKey];
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
