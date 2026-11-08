import { QuestTemplate } from '@keira/shared/acore-world-model';
import { checkQuestTemplate, questReferences } from './quest-checks';

const quest = (fields: Partial<QuestTemplate>): QuestTemplate => Object.assign(new QuestTemplate(), fields);
const keys = (fields: Partial<QuestTemplate>) => Object.fromEntries(checkQuestTemplate(quest(fields)).map((p) => [p.key, p.fields]));

describe('checkQuestTemplate', () => {
  it('finds nothing in a plain quest', () => {
    expect(checkQuestTemplate(quest({ RequiredItemId1: 5, RequiredItemCount1: 1, RewardItem1: 7, RewardAmount1: 1 }))).toEqual([]);
  });

  it('finds ids without counts and counts without ids', () => {
    expect(
      keys({
        RequiredItemId1: 5,
        RequiredItemCount2: 1,
        ItemDrop1: 3,
        ItemDropQuantity2: 1,
        RequiredNpcOrGo1: 9,
        RequiredNpcOrGoCount2: 1,
        RewardChoiceItemID1: 4,
        RewardChoiceItemQuantity2: 1,
        RewardItem1: 7,
        RewardAmount2: 1,
      }),
    ).toEqual({
      REQUIRED_ITEM_NO_COUNT: ['RequiredItemId1'],
      REQUIRED_COUNT_NO_ITEM: ['RequiredItemCount2'],
      DROP_QUANTITY_NO_ITEM: ['ItemDropQuantity2'],
      NPC_OR_GO_NO_COUNT: ['RequiredNpcOrGo1'],
      COUNT_NO_NPC_OR_GO: ['RequiredNpcOrGoCount2'],
      CHOICE_QUANTITY_NO_ITEM: ['RewardChoiceItemQuantity2'],
      REWARD_ITEM_NO_AMOUNT: ['RewardItem1'],
      REWARD_AMOUNT_NO_ITEM: ['RewardAmount2'],
    });
  });

  it('finds reward items after an empty one, choices of a tracking quest and reputations', () => {
    expect(
      keys({
        RewardItem2: 7,
        RewardAmount2: 1,
        Flags: 0x400,
        RewardChoiceItemID3: 4,
        RewardChoiceItemQuantity3: 1,
        RewardFactionValue1: 10,
        RewardFactionID1: 72,
        RewardFactionOverride2: 100,
        RequiredFactionValue2: 3000,
      }),
    ).toEqual({
      REWARD_ITEM_GAP: ['RewardItem2'],
      TRACKING_CHOICE: ['RewardChoiceItemID3'],
      REWARD_FACTION_VALUE_RANGE: ['RewardFactionValue1'],
      REWARD_OVERRIDE_NO_FACTION: ['RewardFactionOverride2'],
      FACTION_VALUE_NO_FACTION: ['RequiredFactionValue2'],
    });
    expect(
      keys({
        RewardItem1: 1,
        RewardAmount1: 1,
        RewardItem2: 2,
        RewardAmount2: 1,
        RewardItem3: 3,
        RewardAmount3: 1,
        RewardItem4: 4,
        RewardAmount4: 1,
      }),
    ).toEqual({});
  });
});

describe('questReferences', () => {
  it('lists the items, creatures, gameobjects and next quest used, once each', () => {
    expect(
      questReferences(
        quest({
          StartItem: 5,
          RequiredItemId1: 5,
          RewardChoiceItemID2: 6,
          RequiredNpcOrGo1: 10,
          RequiredNpcOrGo2: -20,
          RequiredNpcOrGo3: 10,
          RewardNextQuest: 300,
        }),
      ),
    ).toEqual({ items: [5, 6], creatures: [10], gameobjects: [20], quests: [300] });
  });
});
