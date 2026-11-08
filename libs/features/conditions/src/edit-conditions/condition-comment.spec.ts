import { CONDITION_SOURCE_TYPES as ST, CONDITION_TYPES as CT, Conditions } from '@keira/shared/acore-world-model';
import { conditionComment } from './condition-comment';

const condition = (fields: Partial<Conditions>): Conditions => Object.assign(new Conditions(), fields);

describe('conditionComment', () => {
  it('says what the condition is on', () => {
    const on = (SourceTypeOrReferenceId: number, SourceGroup = 2, SourceEntry = 3, SourceId = 0): string =>
      conditionComment(condition({ SourceTypeOrReferenceId, SourceGroup, SourceEntry, SourceId })).split(' - ')[0];

    expect(on(ST.SOURCE_TYPE_CREATURE_LOOT_TEMPLATE)).toBe('Creature loot 2: item 3');
    expect(on(ST.SOURCE_TYPE_PLAYER_LOOT_TEMPLATE)).toBe('Player loot 2: item 3');
    expect(on(ST.SOURCE_TYPE_SPELL_IMPLICIT_TARGET)).toBe('Spell 3 targets (effect mask 2)');
    expect(on(ST.SOURCE_TYPE_GOSSIP_MENU)).toBe('Gossip menu 2: text 3');
    expect(on(ST.SOURCE_TYPE_GOSSIP_MENU_OPTION)).toBe('Gossip menu 2: option 3');
    expect(on(ST.SOURCE_TYPE_CREATURE_TEMPLATE_VEHICLE)).toBe('Vehicle 3');
    expect(on(ST.SOURCE_TYPE_SPELL)).toBe('Spell 3');
    expect(on(ST.SOURCE_TYPE_SPELL_CLICK_EVENT)).toBe('Spellclick of creature 2: spell 3');
    expect(on(ST.SOURCE_TYPE_QUEST_AVAILABLE)).toBe('Quest 3 available');
    expect(on(ST.SOURCE_TYPE_VEHICLE_SPELL)).toBe('Vehicle 2: spell 3');
    expect(on(ST.SOURCE_TYPE_SMART_EVENT, 2, 3, 1)).toBe('SmartAI event 1 of gameobject 3');
    expect(on(ST.SOURCE_TYPE_SMART_EVENT, 1, 3, 20)).toBe('SmartAI event 0 of source 20 3');
    expect(on(ST.SOURCE_TYPE_NPC_VENDOR)).toBe('Vendor 2: item 3');
    expect(on(ST.SOURCE_TYPE_SPELL_PROC)).toBe('Spell 3 proc');
    expect(on(ST.SOURCE_TYPE_CREATURE_RESPAWN)).toBe('Creature 3 respawn');
    expect(on(ST.SOURCE_TYPE_OBJECT_VISIBILITY, 1)).toBe('Gameobject 3 visible');
    expect(on(ST.SOURCE_TYPE_OBJECT_VISIBILITY, 0)).toBe('Creature 3 visible');
    expect(on(-5)).toBe('Reference 5');
    expect(on(ST.SOURCE_TYPE_GOSSIP_HELLO)).toBe('Source 20 3');
  });

  it('says what has to be true, negated and grouped', () => {
    const is = (ConditionTypeOrReference: number, ConditionValue1 = 1, ConditionValue2 = 2, ConditionValue3 = 0): string =>
      conditionComment(condition({ ConditionTypeOrReference, ConditionValue1, ConditionValue2, ConditionValue3 })).split(' - ')[1];

    const expected: [number, string, number?, number?, number?][] = [
      [CT.CONDITION_AURA, 'Target has aura 1 (effect 2)'],
      [CT.CONDITION_ITEM, 'Target has 2 of item 1'],
      [CT.CONDITION_ITEM, 'Target has 1 of item 1 (bank too)', 1, 0, 1],
      [CT.CONDITION_ITEM_EQUIPPED, 'Target has item 1 equipped'],
      [CT.CONDITION_ZONEID, 'Target is in zone 1'],
      [CT.CONDITION_REPUTATION_RANK, 'Target has reputation rank mask 2 with faction 1'],
      [CT.CONDITION_TEAM, 'Target is Alliance', 469],
      [CT.CONDITION_TEAM, 'Target is team 1'],
      [CT.CONDITION_SKILL, 'Target has skill 1 at 2'],
      [CT.CONDITION_QUESTREWARDED, 'Target has quest 1 rewarded'],
      [CT.CONDITION_QUESTTAKEN, 'Target has quest 1 taken'],
      [CT.CONDITION_DRUNKENSTATE, 'Target is drunk (state 1)'],
      [CT.CONDITION_WORLD_STATE, 'Target world state 1 is 2'],
      [CT.CONDITION_ACTIVE_EVENT, 'Target game event 1 is active'],
      [CT.CONDITION_INSTANCE_INFO, 'Target instance data 1 is 2'],
      [CT.CONDITION_QUEST_NONE, 'Target has never taken quest 1'],
      [CT.CONDITION_CLASS, 'Target is class mask 1'],
      [CT.CONDITION_RACE, 'Target is race mask 1'],
      [CT.CONDITION_ACHIEVEMENT, 'Target has achievement 1'],
      [CT.CONDITION_TITLE, 'Target has title 1'],
      [CT.CONDITION_SPAWNMASK, 'Target spawn mask 1'],
      [CT.CONDITION_GENDER, 'Target is female'],
      [CT.CONDITION_GENDER, 'Target is gender 9', 9],
      [CT.CONDITION_UNIT_STATE, 'Target has unit state 1'],
      [CT.CONDITION_MAPID, 'Target is in map 1'],
      [CT.CONDITION_AREAID, 'Target is in area 1'],
      [CT.CONDITION_CREATURE_TYPE, 'Target is creature type 1'],
      [CT.CONDITION_SPELL, 'Target knows spell 1'],
      [CT.CONDITION_PHASEMASK, 'Target is in phase mask 1'],
      [CT.CONDITION_LEVEL, 'Target level < 1'],
      [CT.CONDITION_LEVEL, 'Target level = 1', 1, 9],
      [CT.CONDITION_QUEST_COMPLETE, 'Target has quest 1 complete'],
      [CT.CONDITION_NEAR_CREATURE, 'Target is within 2 yards of creature 1'],
      [CT.CONDITION_NEAR_CREATURE, 'Target is within 2 yards of creature 1 (dead)', 1, 2, 1],
      [CT.CONDITION_NEAR_GAMEOBJECT, 'Target is within 2 yards of gameobject 1'],
      [CT.CONDITION_OBJECT_ENTRY_GUID, 'Target is creature 2 (guid 7)', 3, 2, 7],
      [CT.CONDITION_OBJECT_ENTRY_GUID, 'Target is type 1', 1, 0],
      [CT.CONDITION_OBJECT_ENTRY_GUID, 'Target is player', 4, 0],
      [CT.CONDITION_TYPE_MASK, 'Target is type mask 1'],
      [CT.CONDITION_RELATION_TO, 'Target has relation 2 to target 1'],
      [CT.CONDITION_REACTION_TO, 'Target has reaction mask 2 to target 1'],
      [CT.CONDITION_DISTANCE_TO, 'Target is >= 2 yards from target 1', 1, 2, 3],
      [CT.CONDITION_DISTANCE_TO, 'Target is = 2 yards from target 1', 1, 2, 8],
      [CT.CONDITION_ALIVE, 'Target is alive'],
      [CT.CONDITION_HP_VAL, 'Target has health < 1'],
      [CT.CONDITION_HP_VAL, 'Target has health = 1', 1, 7],
      [CT.CONDITION_HP_PCT, 'Target has health < 1%'],
      [CT.CONDITION_HP_PCT, 'Target has health = 1%', 1, 7],
      [CT.CONDITION_REALM_ACHIEVEMENT, 'Target realm first achievement 1 done'],
      [CT.CONDITION_IN_WATER, 'Target is in water'],
      [CT.CONDITION_STAND_STATE, 'Target stand state 2 (any)'],
      [CT.CONDITION_STAND_STATE, 'Target stand state 2 (exact)', 0],
      [CT.CONDITION_DAILY_QUEST_DONE, 'Target has done daily quest 1'],
      [CT.CONDITION_CHARMED, 'Target is charmed'],
      [CT.CONDITION_PET_TYPE, 'Target has pet type mask 1'],
      [CT.CONDITION_TAXI, 'Target is on a taxi'],
      [CT.CONDITION_QUESTSTATE, 'Target has quest 1 in state mask 2'],
      [CT.CONDITION_QUEST_OBJECTIVE_PROGRESS, 'Target has quest 1 objective 2 at 3', 1, 2, 3],
      [CT.CONDITION_DIFFICULTY_ID, 'Target is in difficulty 1'],
      [CT.CONDITION_QUEST_SATISFY_EXCLUSIVE, 'Target can take quest 1 (exclusive group)'],
      [CT.CONDITION_HAS_AURA_TYPE, 'Target has an aura of type 1'],
      [CT.CONDITION_WORLD_SCRIPT, 'Target world script condition 1 (state 2)'],
      [CT.CONDITION_AI_DATA, 'Target AI data 1 is 2'],
      [CT.CONDITION_RANDOM_DUNGEON, 'Target is in a random dungeon (difficulty 2)'],
      [CT.CONDITION_RANDOM_DUNGEON, 'Target is in a random dungeon', 0],
      [CT.CONDITION_UNIT_IN_COMBAT, 'Target is in combat'],
      [CT.CONDITION_NONE, 'Target always'],
      [-4, 'Target reference 4'],
      [CT.UNUSED, 'Target condition 41 (1, 2, 0)'],
    ];
    for (const [type, text, v1, v2, v3] of expected) {
      expect(is(type, v1, v2, v3)).toBe(text);
    }

    expect(
      conditionComment(condition({ ConditionTypeOrReference: CT.CONDITION_ALIVE, ConditionTarget: 1, NegativeCondition: 1, ElseGroup: 2 })),
    ).toBe('Source 0 0 - NOT Target 1 is alive (group 2)');
  });
});
