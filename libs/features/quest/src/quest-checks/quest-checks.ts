import { QuestTemplate } from '@keira/shared/acore-world-model';

/**
 * Checks of a quest_template row, as AzerothCore's ObjectMgr::LoadQuests makes when it loads the quests (logging the
 * ones it corrects or refuses).
 */

/** A problem with some fields of a quest (an i18n key under `QUEST.CHECK.`, and the fields). */
export interface QuestProblem {
  key: string;
  fields: string[];
}

/** QUEST_FLAGS_TRACKING: the quest is only tracked, its choice rewards can't be given. */
const QUEST_FLAGS_TRACKING = 0x400;

type Row = Record<string, number>;
const n = (count: number): number[] => Array.from({ length: count }, (_, i) => i + 1);

export function checkQuestTemplate(quest: QuestTemplate): QuestProblem[] {
  const row = quest as unknown as Row;
  const problems = new Map<string, string[]>();
  const add = (key: string, field: string) => problems.set(key, [...(problems.get(key) ?? []), field]);
  const pairs = (id: string, count: string, max: number, noCount: string | null, noId: string) => {
    for (const i of n(max)) {
      if (row[`${id}${i}`] && !row[`${count}${i}`] && noCount) {
        add(noCount, `${id}${i}`);
      }
      if (!row[`${id}${i}`] && row[`${count}${i}`]) {
        add(noId, `${count}${i}`);
      }
    }
  };

  pairs('RequiredItemId', 'RequiredItemCount', 6, 'REQUIRED_ITEM_NO_COUNT', 'REQUIRED_COUNT_NO_ITEM');
  pairs('ItemDrop', 'ItemDropQuantity', 4, null, 'DROP_QUANTITY_NO_ITEM');
  pairs('RequiredNpcOrGo', 'RequiredNpcOrGoCount', 4, 'NPC_OR_GO_NO_COUNT', 'COUNT_NO_NPC_OR_GO');
  pairs('RewardChoiceItemID', 'RewardChoiceItemQuantity', 6, null, 'CHOICE_QUANTITY_NO_ITEM');
  pairs('RewardItem', 'RewardAmount', 4, 'REWARD_ITEM_NO_AMOUNT', 'REWARD_AMOUNT_NO_ITEM');

  // (the reward items are read until the first empty one)
  const firstEmpty = n(4).find((i) => !row[`RewardItem${i}`]);
  if (firstEmpty) {
    for (const i of n(4).filter((i) => i > firstEmpty && row[`RewardItem${i}`])) {
      add('REWARD_ITEM_GAP', `RewardItem${i}`);
    }
  }
  if (row['Flags'] & QUEST_FLAGS_TRACKING) {
    for (const i of n(6).filter((i) => row[`RewardChoiceItemID${i}`])) {
      add('TRACKING_CHOICE', `RewardChoiceItemID${i}`);
    }
  }
  for (const i of n(5)) {
    if (Math.abs(row[`RewardFactionValue${i}`]) > 9) {
      add('REWARD_FACTION_VALUE_RANGE', `RewardFactionValue${i}`);
    }
    if (!row[`RewardFactionID${i}`] && row[`RewardFactionOverride${i}`]) {
      add('REWARD_OVERRIDE_NO_FACTION', `RewardFactionOverride${i}`);
    }
  }
  for (const i of [1, 2]) {
    if (!row[`RequiredFactionId${i}`] && row[`RequiredFactionValue${i}`]) {
      add('FACTION_VALUE_NO_FACTION', `RequiredFactionValue${i}`);
    }
  }
  return [...problems].map(([key, fields]) => ({ key, fields }));
}

/** The ids a quest uses that must exist: items, creatures, gameobjects, the next quest. */
export interface QuestReferences {
  items: number[];
  creatures: number[];
  gameobjects: number[];
  quests: number[];
}

export function questReferences(quest: QuestTemplate): QuestReferences {
  const row = quest as unknown as Row;
  const ids = (fields: string[]) => [...new Set(fields.map((field) => row[field]).filter((id) => id > 0))];
  const npcOrGo = n(4).map((i) => row[`RequiredNpcOrGo${i}`]);
  return {
    items: ids([
      'StartItem',
      ...n(6).map((i) => `RequiredItemId${i}`),
      ...n(4).map((i) => `ItemDrop${i}`),
      ...n(4).map((i) => `RewardItem${i}`),
      ...n(6).map((i) => `RewardChoiceItemID${i}`),
    ]),
    creatures: [...new Set(npcOrGo.filter((id) => id > 0))],
    gameobjects: [...new Set(npcOrGo.filter((id) => id < 0).map((id) => -id))],
    quests: ids(['RewardNextQuest']),
  };
}
