import { CONDITION_SOURCE_TYPES as ST, CONDITION_TYPES as CT, Conditions } from '@keira/shared/acore-world-model';

const LOOT: Partial<Record<ST, string>> = {
  [ST.SOURCE_TYPE_CREATURE_LOOT_TEMPLATE]: 'Creature',
  [ST.SOURCE_TYPE_DISENCHANT_LOOT_TEMPLATE]: 'Disenchant',
  [ST.SOURCE_TYPE_FISHING_LOOT_TEMPLATE]: 'Fishing',
  [ST.SOURCE_TYPE_GAMEOBJECT_LOOT_TEMPLATE]: 'Gameobject',
  [ST.SOURCE_TYPE_ITEM_LOOT_TEMPLATE]: 'Item',
  [ST.SOURCE_TYPE_MAIL_LOOT_TEMPLATE]: 'Mail',
  [ST.SOURCE_TYPE_MILLING_LOOT_TEMPLATE]: 'Milling',
  [ST.SOURCE_TYPE_PICKPOCKETING_LOOT_TEMPLATE]: 'Pickpocketing',
  [ST.SOURCE_TYPE_PROSPECTING_LOOT_TEMPLATE]: 'Prospecting',
  [ST.SOURCE_TYPE_REFERENCE_LOOT_TEMPLATE]: 'Reference',
  [ST.SOURCE_TYPE_SKINNING_LOOT_TEMPLATE]: 'Skinning',
  [ST.SOURCE_TYPE_SPELL_LOOT_TEMPLATE]: 'Spell',
  [ST.SOURCE_TYPE_PLAYER_LOOT_TEMPLATE]: 'Player',
};

/** smart_scripts.source_type, as SourceId of a SmartAI event condition. */
const SMART_SOURCE = ['creature', 'gameobject', 'areatrigger', 'event', 'gossip', 'quest', 'spell', 'transport', 'instance', 'actionlist'];
/** CONDITION_OBJECT_ENTRY_GUID's TypeID. */
const TYPE_ID: Record<number, string> = { 3: 'creature', 4: 'player', 5: 'gameobject', 7: 'corpse' };
const TEAM: Record<number, string> = { 469: 'Alliance', 67: 'Horde' };

/** What the condition is on (SourceType, SourceGroup, SourceEntry, SourceId). */
function sourceText(c: Conditions): string {
  const loot = LOOT[c.SourceTypeOrReferenceId as ST];
  if (loot) {
    return `${loot} loot ${c.SourceGroup}: item ${c.SourceEntry}`;
  }
  switch (c.SourceTypeOrReferenceId) {
    case ST.SOURCE_TYPE_SPELL_IMPLICIT_TARGET:
      return `Spell ${c.SourceEntry} targets (effect mask ${c.SourceGroup})`;
    case ST.SOURCE_TYPE_GOSSIP_MENU:
      return `Gossip menu ${c.SourceGroup}: text ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_GOSSIP_MENU_OPTION:
      return `Gossip menu ${c.SourceGroup}: option ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_CREATURE_TEMPLATE_VEHICLE:
      return `Vehicle ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_SPELL:
      return `Spell ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_SPELL_CLICK_EVENT:
      return `Spellclick of creature ${c.SourceGroup}: spell ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_QUEST_AVAILABLE:
      return `Quest ${c.SourceEntry} available`;
    case ST.SOURCE_TYPE_VEHICLE_SPELL:
      return `Vehicle ${c.SourceGroup}: spell ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_SMART_EVENT:
      return `SmartAI event ${c.SourceGroup - 1} of ${SMART_SOURCE[c.SourceId] ?? `source ${c.SourceId}`} ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_NPC_VENDOR:
      return `Vendor ${c.SourceGroup}: item ${c.SourceEntry}`;
    case ST.SOURCE_TYPE_SPELL_PROC:
      return `Spell ${c.SourceEntry} proc`;
    case ST.SOURCE_TYPE_CREATURE_RESPAWN:
      return `Creature ${c.SourceEntry} respawn`;
    case ST.SOURCE_TYPE_OBJECT_VISIBILITY:
      return `${c.SourceGroup === 1 ? 'Gameobject' : 'Creature'} ${c.SourceEntry} visible`;
    default:
      return c.SourceTypeOrReferenceId < 0
        ? `Reference ${-c.SourceTypeOrReferenceId}`
        : `Source ${c.SourceTypeOrReferenceId} ${c.SourceEntry}`;
  }
}

/** What has to be true (ConditionType and its values), negated when NegativeCondition. */
function conditionText(c: Conditions): string {
  const [v1, v2, v3] = [c.ConditionValue1, c.ConditionValue2, c.ConditionValue3];
  switch (c.ConditionTypeOrReference) {
    case CT.CONDITION_AURA:
      return `has aura ${v1} (effect ${v2})`;
    case CT.CONDITION_ITEM:
      return `has ${v2 || 1} of item ${v1}${v3 ? ' (bank too)' : ''}`;
    case CT.CONDITION_ITEM_EQUIPPED:
      return `has item ${v1} equipped`;
    case CT.CONDITION_ZONEID:
      return `is in zone ${v1}`;
    case CT.CONDITION_REPUTATION_RANK:
      return `has reputation rank mask ${v2} with faction ${v1}`;
    case CT.CONDITION_TEAM:
      return `is ${TEAM[v1] ?? `team ${v1}`}`;
    case CT.CONDITION_SKILL:
      return `has skill ${v1} at ${v2}`;
    case CT.CONDITION_QUESTREWARDED:
      return `has quest ${v1} rewarded`;
    case CT.CONDITION_QUESTTAKEN:
      return `has quest ${v1} taken`;
    case CT.CONDITION_DRUNKENSTATE:
      return `is drunk (state ${v1})`;
    case CT.CONDITION_WORLD_STATE:
      return `world state ${v1} is ${v2}`;
    case CT.CONDITION_ACTIVE_EVENT:
      return `game event ${v1} is active`;
    case CT.CONDITION_INSTANCE_INFO:
      return `instance data ${v1} is ${v2}`;
    case CT.CONDITION_QUEST_NONE:
      return `has never taken quest ${v1}`;
    case CT.CONDITION_CLASS:
      return `is class mask ${v1}`;
    case CT.CONDITION_RACE:
      return `is race mask ${v1}`;
    case CT.CONDITION_ACHIEVEMENT:
      return `has achievement ${v1}`;
    case CT.CONDITION_TITLE:
      return `has title ${v1}`;
    case CT.CONDITION_SPAWNMASK:
      return `spawn mask ${v1}`;
    case CT.CONDITION_GENDER:
      return `is ${['male', 'female', 'genderless'][v1] ?? `gender ${v1}`}`;
    case CT.CONDITION_UNIT_STATE:
      return `has unit state ${v1}`;
    case CT.CONDITION_MAPID:
      return `is in map ${v1}`;
    case CT.CONDITION_AREAID:
      return `is in area ${v1}`;
    case CT.CONDITION_CREATURE_TYPE:
      return `is creature type ${v1}`;
    case CT.CONDITION_SPELL:
      return `knows spell ${v1}`;
    case CT.CONDITION_PHASEMASK:
      return `is in phase mask ${v1}`;
    case CT.CONDITION_LEVEL:
      return `level ${['=', '>', '<', '>=', '<='][v2] ?? '='} ${v1}`;
    case CT.CONDITION_QUEST_COMPLETE:
      return `has quest ${v1} complete`;
    case CT.CONDITION_NEAR_CREATURE:
      return `is within ${v2} yards of creature ${v1}${v3 ? ' (dead)' : ''}`;
    case CT.CONDITION_NEAR_GAMEOBJECT:
      return `is within ${v2} yards of gameobject ${v1}`;
    case CT.CONDITION_OBJECT_ENTRY_GUID:
      return `is ${TYPE_ID[v1] ?? `type ${v1}`}${v2 ? ` ${v2}` : ''}${v3 ? ` (guid ${v3})` : ''}`;
    case CT.CONDITION_TYPE_MASK:
      return `is type mask ${v1}`;
    case CT.CONDITION_RELATION_TO:
      return `has relation ${v2} to target ${v1}`;
    case CT.CONDITION_REACTION_TO:
      return `has reaction mask ${v2} to target ${v1}`;
    case CT.CONDITION_DISTANCE_TO:
      return `is ${['=', '>', '<', '>=', '<='][v3] ?? '='} ${v2} yards from target ${v1}`;
    case CT.CONDITION_ALIVE:
      return 'is alive';
    case CT.CONDITION_HP_VAL:
      return `has health ${['=', '>', '<', '>=', '<='][v2] ?? '='} ${v1}`;
    case CT.CONDITION_HP_PCT:
      return `has health ${['=', '>', '<', '>=', '<='][v2] ?? '='} ${v1}%`;
    case CT.CONDITION_REALM_ACHIEVEMENT:
      return `realm first achievement ${v1} done`;
    case CT.CONDITION_IN_WATER:
      return 'is in water';
    case CT.CONDITION_STAND_STATE:
      return `stand state ${v2} (${v1 ? 'any' : 'exact'})`;
    case CT.CONDITION_DAILY_QUEST_DONE:
      return `has done daily quest ${v1}`;
    case CT.CONDITION_CHARMED:
      return 'is charmed';
    case CT.CONDITION_PET_TYPE:
      return `has pet type mask ${v1}`;
    case CT.CONDITION_TAXI:
      return 'is on a taxi';
    case CT.CONDITION_QUESTSTATE:
      return `has quest ${v1} in state mask ${v2}`;
    case CT.CONDITION_QUEST_OBJECTIVE_PROGRESS:
      return `has quest ${v1} objective ${v2} at ${v3}`;
    case CT.CONDITION_DIFFICULTY_ID:
      return `is in difficulty ${v1}`;
    case CT.CONDITION_QUEST_SATISFY_EXCLUSIVE:
      return `can take quest ${v1} (exclusive group)`;
    case CT.CONDITION_HAS_AURA_TYPE:
      return `has an aura of type ${v1}`;
    case CT.CONDITION_WORLD_SCRIPT:
      return `world script condition ${v1} (state ${v2})`;
    case CT.CONDITION_AI_DATA:
      return `AI data ${v1} is ${v2}`;
    case CT.CONDITION_RANDOM_DUNGEON:
      return `is in a random dungeon${v1 ? ` (difficulty ${v2})` : ''}`;
    case CT.CONDITION_UNIT_IN_COMBAT:
      return 'is in combat';
    case CT.CONDITION_NONE:
      return 'always';
    default:
      return c.ConditionTypeOrReference < 0
        ? `reference ${-c.ConditionTypeOrReference}`
        : `condition ${c.ConditionTypeOrReference} (${v1}, ${v2}, ${v3})`;
  }
}

/** A comment for a condition, the way SmartAI rows get theirs (#3153): what it is on, then what has to be true. */
export function conditionComment(c: Conditions): string {
  const who = c.ConditionTarget ? `Target ${c.ConditionTarget}` : 'Target';
  const negative = c.NegativeCondition ? 'NOT ' : '';
  const group = c.ElseGroup ? ` (group ${c.ElseGroup})` : '';
  return `${sourceText(c)} - ${negative}${who} ${conditionText(c)}${group}`;
}
