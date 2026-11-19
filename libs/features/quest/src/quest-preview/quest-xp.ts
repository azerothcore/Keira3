/** The highest player level (WotLK). */
export const MAX_PLAYER_LEVEL = 80;

/**
 * The experience a quest gives a player of a level, as the core computes it (`Quest::XPValue`): the QuestXP.dbc
 * amount of the quest's level and RewardXPDifficulty (`baseXp`), lowered when the player is more than 5 levels above
 * the quest, then rounded to 5/10/25/50. A quest level of -1 is the player's own.
 */
export function questXp(baseXp: number, questLevel: number, playerLevel: number): number {
  const level = questLevel === -1 ? playerLevel : questLevel;
  const diffFactor = Math.min(10, Math.max(1, 2 * (level - playerLevel) + 20));
  const xp = Math.floor((diffFactor * baseXp) / 10);
  if (xp <= 100) {
    return 5 * Math.floor((xp + 2) / 5);
  }
  if (xp <= 500) {
    return 10 * Math.floor((xp + 5) / 10);
  }
  if (xp <= 1000) {
    return 25 * Math.floor((xp + 12) / 25);
  }
  return 50 * Math.floor((xp + 25) / 50);
}
