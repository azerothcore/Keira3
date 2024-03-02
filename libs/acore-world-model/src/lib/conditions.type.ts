import { TableRow } from './general';

export const CONDITIONS_TABLE = 'conditions';
export const CONDITIONS_ID_FIELDS = [
  'SourceTypeOrReferenceId',
  'SourceGroup',
  'SourceEntry',
  'SourceId',
  'ElseGroup',
  'ConditionTypeOrReference',
  'ConditionTarget',
  'ConditionValue1',
  'ConditionValue2',
  'ConditionValue3',
];
export const CONDITIONS_SEARCH_FIELDS = ['SourceTypeOrReferenceId', 'SourceGroup', 'SourceEntry'];

export class Conditions extends TableRow {
  SourceTypeOrReferenceId: number = 0;
  SourceGroup: number = 0;
  SourceEntry: number = 0;
  SourceId: number = 0;
  ElseGroup: number = 0;
  ConditionTypeOrReference: number = 0;
  ConditionTarget: number = 0;
  ConditionValue1: number = 0;
  ConditionValue2: number = 0;
  ConditionValue3: number = 0;
  NegativeCondition: number = 0;
  ErrorType: number = 0;
  ErrorTextId: number = 0;
  ScriptName: string = '';
  Comment: string = '';
}

export enum CONDITION_SOURCE_TYPES {
  SOURCE_TYPE_NONE,
  SOURCE_TYPE_CREATURE_LOOT_TEMPLATE,
  SOURCE_TYPE_DISENCHANT_LOOT_TEMPLATE,
  SOURCE_TYPE_FISHING_LOOT_TEMPLATE,
  SOURCE_TYPE_GAMEOBJECT_LOOT_TEMPLATE,
  SOURCE_TYPE_ITEM_LOOT_TEMPLATE,
  SOURCE_TYPE_MAIL_LOOT_TEMPLATE,
  SOURCE_TYPE_MILLING_LOOT_TEMPLATE,
  SOURCE_TYPE_PICKPOCKETING_LOOT_TEMPLATE,
  SOURCE_TYPE_PROSPECTING_LOOT_TEMPLATE,
  SOURCE_TYPE_REFERENCE_LOOT_TEMPLATE,
  SOURCE_TYPE_SKINNING_LOOT_TEMPLATE,
  SOURCE_TYPE_SPELL_LOOT_TEMPLATE,
  SOURCE_TYPE_SPELL_IMPLICIT_TARGET,
  SOURCE_TYPE_GOSSIP_MENU,
  SOURCE_TYPE_GOSSIP_MENU_OPTION,
  SOURCE_TYPE_CREATURE_TEMPLATE_VEHICLE,
  SOURCE_TYPE_SPELL,
  SOURCE_TYPE_SPELL_CLICK_EVENT,
  SOURCE_TYPE_QUEST_AVAILABLE,
  SOURCE_TYPE_UNUSED_20,
  SOURCE_TYPE_VEHICLE_SPELL,
  SOURCE_TYPE_SMART_EVENT,
  SOURCE_TYPE_NPC_VENDOR,
  SOURCE_TYPE_SPELL_PROC,
}

export enum CONDITION_TYPES {
  CONDITION_NONE,
  CONDITION_AURA,
  CONDITION_ITEM,
  CONDITION_ITEM_EQUIPPED,
  CONDITION_ZONEID,
  CONDITION_REPUTATION_RANK,
  CONDITION_TEAM,
  CONDITION_SKILL,
  CONDITION_QUESTREWARDED,
  CONDITION_QUESTTAKEN,
  CONDITION_DRUNKENSTATE,
  CONDITION_WORLD_STATE,
  CONDITION_ACTIVE_EVENT,
  CONDITION_INSTANCE_INFO,
  CONDITION_QUEST_NONE,
  CONDITION_CLASS,
  CONDITION_RACE,
  CONDITION_ACHIEVEMENT,
  CONDITION_TITLE,
  CONDITION_SPAWNMASK,
  CONDITION_GENDER,
  CONDITION_UNIT_STATE,
  CONDITION_MAPID,
  CONDITION_AREAID,
  CONDITION_CREATURE_TYPE,
  CONDITION_SPELL,
  CONDITION_PHASEMASK,
  CONDITION_LEVEL,
  CONDITION_QUEST_COMPLETE,
  CONDITION_NEAR_CREATURE,
  CONDITION_NEAR_GAMEOBJECT,
  CONDITION_OBJECT_ENTRY_GUID,
  CONDITION_TYPE_MASK,
  CONDITION_RELATION_TO,
  CONDITION_REACTION_TO,
  CONDITION_DISTANCE_TO,
  CONDITION_ALIVE,
  CONDITION_HP_VAL,
  CONDITION_HP_PCT,
  CONDITION_REALM_ACHIEVEMENT,
  CONDITION_IN_WATER,
  UNUSED,
  CONDITION_STAND_STATE,
  CONDITION_DAILY_QUEST_DONE,
  CONDITION_CHARMED,
  CONDITION_PET_TYPE,
  CONDITION_TAXI,
  CONDITION_QUESTSTATE,
  CONDITION_QUEST_OBJECTIVE_PROGRESS,
  CONDITION_DIFFICULTY_ID,
}
export const CONDITION_TYPES_KEYS = getEnumKeys(CONDITION_TYPES);
