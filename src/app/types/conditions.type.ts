import { TableRow } from './general';

export const CONDITIONS_TABLE = 'conditions';
export const CONDITIONS_SEARCH_FIELDS = [
  'SourceTypeOrReferenceId',
  'SourceGroup',
  'SourceEntry',
];

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
  SOURCE_TYPE_VEHICLE_SPELL,
  UNUSED,
  SOURCE_TYPE_SMART_EVENT,
  SOURCE_TYPE_NPC_VENDOR,
  SOURCE_TYPE_SPELL_PROC,
}
