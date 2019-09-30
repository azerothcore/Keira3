import { CONDITION_SOURCE_TYPES as ST, CONDITION_TYPES as CT } from '../../../../types/conditions.type';

export const SOURCE_GROUP_TOOLTIPS = [];
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_NONE] = '';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_CREATURE_LOOT_TEMPLATE] = 'creature_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_DISENCHANT_LOOT_TEMPLATE] = 'disenchant_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_FISHING_LOOT_TEMPLATE] = 'fishing_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_GAMEOBJECT_LOOT_TEMPLATE] = 'gameobject_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_ITEM_LOOT_TEMPLATE] = 'item_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_MAIL_LOOT_TEMPLATE] = 'mail_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_MILLING_LOOT_TEMPLATE] = 'milling_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_PICKPOCKETING_LOOT_TEMPLATE] = 'pickpocketing_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_PROSPECTING_LOOT_TEMPLATE] = 'prospecting_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_REFERENCE_LOOT_TEMPLATE] = 'reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_SKINNING_LOOT_TEMPLATE] = 'skinning_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_SPELL_LOOT_TEMPLATE] = 'spell_loot_template or reference_loot_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_SPELL_IMPLICIT_TARGET] = 'Mask of effects to be affected by condition: 1 = EFFECT_0, 2 = EFFECT_1, 4 = EFFECT_2';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_GOSSIP_MENU] = 'gossip_menu.MenuID';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_GOSSIP_MENU_OPTION] = 'gossip_menu_option.MenuId';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_CREATURE_TEMPLATE_VEHICLE] = 'Always 0';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_SPELL] = 'Always 0';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_SPELL_CLICK_EVENT] = 'npc_spellclick_spells.npc_entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_QUEST_AVAILABLE] = 'Always 0';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_VEHICLE_SPELL] = 'creature_template Entry';
SOURCE_GROUP_TOOLTIPS[ST.UNUSED] = '';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_SMART_EVENT] = 'ID (smart_scripts.id) + 1';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_NPC_VENDOR] = 'npc_vendor Entry';
SOURCE_GROUP_TOOLTIPS[ST.SOURCE_TYPE_SPELL_PROC] = 'Always 0';

export const SOURCE_ENTRY_TOOLTIPS = [];
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_NONE] = '';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_CREATURE_LOOT_TEMPLATE] = 'creature_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_DISENCHANT_LOOT_TEMPLATE] = 'disenchant_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_FISHING_LOOT_TEMPLATE] = 'fishing_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_GAMEOBJECT_LOOT_TEMPLATE] = 'gameobject_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_ITEM_LOOT_TEMPLATE] = 'item_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_MAIL_LOOT_TEMPLATE] = 'mail_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_MILLING_LOOT_TEMPLATE] = 'milling_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_PICKPOCKETING_LOOT_TEMPLATE] = 'pickpocketing_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_PROSPECTING_LOOT_TEMPLATE] = 'prospecting_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_REFERENCE_LOOT_TEMPLATE] = 'reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_SKINNING_LOOT_TEMPLATE] = 'skinning_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_SPELL_LOOT_TEMPLATE] = 'spell_loot_template or reference_loot_template Item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_SPELL_IMPLICIT_TARGET] = 'Spell Id from  Spell.dbc';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_GOSSIP_MENU] = 'gossip_menu.TextID (points to npc_text.ID)';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_GOSSIP_MENU_OPTION] = 'gossip_menu_option.OptionID';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_CREATURE_TEMPLATE_VEHICLE] = 'creature_template.entry';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_SPELL] = 'Spell ID from Spell.dbc';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_SPELL_CLICK_EVENT] = 'Spell (npc_spellclick_spells.spell_id)';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_QUEST_AVAILABLE] = 'Quest ID';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_VEHICLE_SPELL] = 'Spell ID from Spell.dbc';
SOURCE_ENTRY_TOOLTIPS[ST.UNUSED] = '';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_SMART_EVENT] = 'smart_scripts.entryorguid';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_NPC_VENDOR] = 'npc_vendor.item';
SOURCE_ENTRY_TOOLTIPS[ST.SOURCE_TYPE_SPELL_PROC] = 'Spell ID of aura which triggers the proc';

export const CONDITION_TARGET_TOOLTIPS = [];
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_NONE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_CREATURE_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_DISENCHANT_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_FISHING_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_GAMEOBJECT_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_ITEM_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_MAIL_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_MILLING_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_PICKPOCKETING_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_PROSPECTING_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_REFERENCE_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_SKINNING_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_SPELL_LOOT_TEMPLATE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_SPELL_IMPLICIT_TARGET] = '0 = Potential spell Target;  1 = spell Caster';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_GOSSIP_MENU] = '0 = Player;  1 = WorldObject';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_GOSSIP_MENU_OPTION] = '0 = Player;  1 = WorldObject';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_CREATURE_TEMPLATE_VEHICLE] = '0 = Player riding vehicle;  1 = Vehicle creature';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_SPELL] = '0 = spell Caster;  1 =  Explicit Target of the spell (only for spells which take the object selected by caster into account)';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_SPELL_CLICK_EVENT] = '0 = Clicker;  1 = Spellclick target (clickee)';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_QUEST_AVAILABLE] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_VEHICLE_SPELL] = '0 = Player for whom spell bar is shown;  1 =  Vehicle creature';
CONDITION_TARGET_TOOLTIPS[ST.UNUSED] = '';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_SMART_EVENT] = '0 = Invoker;  1 = Object';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_NPC_VENDOR] = 'Always 0';
CONDITION_TARGET_TOOLTIPS[ST.SOURCE_TYPE_SPELL_PROC] = '0 = Actor; 1 = ActionTarget';

export const CONDITION_VALUE_1_TOOLTIPS = [];
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_NONE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_AURA] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_ITEM] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_ITEM_EQUIPPED] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_ZONEID] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_REPUTATION_RANK] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_TEAM] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_SKILL] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_QUESTREWARDED] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_QUESTTAKEN] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_DRUNKENSTATE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_WORLD_STATE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_ACTIVE_EVENT] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_INSTANCE_INFO] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_QUEST_NONE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_CLASS] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_RACE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_ACHIEVEMENT] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_TITLE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_SPAWNMASK] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_GENDER] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_UNIT_STATE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_MAPID] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_AREAID] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_CREATURE_TYPE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_SPELL] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_PHASEMASK] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_LEVEL] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_QUEST_COMPLETE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_NEAR_CREATURE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_NEAR_GAMEOBJECT] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_OBJECT_ENTRY_GUID] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_TYPE_MASK] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_RELATION_TO] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_REACTION_TO] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_DISTANCE_TO] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_ALIVE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_HP_VAL] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_HP_PCT] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_REALM_ACHIEVEMENT] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_IN_WATER] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.UNUSED] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_STAND_STATE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_DAILY_QUEST_DONE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_CHARMED] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_PET_TYPE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_TAXI] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_QUESTSTATE] = 'TODO';
CONDITION_VALUE_1_TOOLTIPS[CT.CONDITION_QUEST_OBJECTIVE_COMPLETE] = 'TODO';

export const CONDITION_VALUE_2_TOOLTIPS = [];
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_NONE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_AURA] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_ITEM] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_ITEM_EQUIPPED] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_ZONEID] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_REPUTATION_RANK] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_TEAM] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_SKILL] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_QUESTREWARDED] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_QUESTTAKEN] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_DRUNKENSTATE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_WORLD_STATE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_ACTIVE_EVENT] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_INSTANCE_INFO] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_QUEST_NONE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_CLASS] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_RACE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_ACHIEVEMENT] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_TITLE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_SPAWNMASK] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_GENDER] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_UNIT_STATE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_MAPID] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_AREAID] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_CREATURE_TYPE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_SPELL] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_PHASEMASK] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_LEVEL] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_QUEST_COMPLETE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_NEAR_CREATURE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_NEAR_GAMEOBJECT] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_OBJECT_ENTRY_GUID] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_TYPE_MASK] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_RELATION_TO] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_REACTION_TO] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_DISTANCE_TO] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_ALIVE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_HP_VAL] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_HP_PCT] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_REALM_ACHIEVEMENT] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_IN_WATER] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.UNUSED] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_STAND_STATE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_DAILY_QUEST_DONE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_CHARMED] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_PET_TYPE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_TAXI] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_QUESTSTATE] = 'TODO';
CONDITION_VALUE_2_TOOLTIPS[CT.CONDITION_QUEST_OBJECTIVE_COMPLETE] = 'TODO';
