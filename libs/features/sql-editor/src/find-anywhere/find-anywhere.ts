/** What an id can be (#5 of the ideas from other tools: WDE's Find Anywhere). */
export type FindKind = 'creature' | 'gameobject' | 'item' | 'quest' | 'spell' | 'broadcastText';
export const FIND_KINDS: FindKind[] = ['creature', 'gameobject', 'item', 'quest', 'spell', 'broadcastText'];

/** A table using an id of a kind: `where` reads it as `@ID`. */
export interface FindReference {
  table: string;
  where: string;
}

const any = (columns: string[]): string => columns.map((column) => `\`${column}\` = @ID`).join(' OR ');
const numbered = (prefix: string, count: number, suffix = ''): string[] =>
  Array.from({ length: count }, (_, i) => `${prefix}${i + 1}${suffix}`);
const smartAction = (actions: number[]): string => `action_type IN (${actions.join(', ')}) AND action_param1 = @ID`;
const scriptCommand = (commands: number[]): string => `command IN (${commands.join(', ')}) AND datalong = @ID`;
const conditionValue = (types: number[]): string => `ConditionTypeOrReference IN (${types.join(', ')}) AND ConditionValue1 = @ID`;
const scriptTables = (where: string): FindReference[] =>
  ['waypoint_scripts', 'event_scripts', 'spell_scripts'].map((table) => ({ table, where }));
const lootTables = [
  'creature',
  'gameobject',
  'item',
  'reference',
  'disenchant',
  'prospecting',
  'milling',
  'pickpocketing',
  'skinning',
  'fishing',
  'mail',
  'spell',
  'player',
].map((loot) => ({ table: `${loot}_loot_template`, where: 'Item = @ID AND Reference = 0' }));

/** Where AzerothCore master uses each kind of id (column names from data/sql/base/db_world, constants from the core). */
export const FIND_REFERENCES: Record<FindKind, FindReference[]> = {
  creature: [
    { table: 'creature', where: any(['id1', 'id2', 'id3']) },
    {
      table: 'creature_template',
      where: any(['difficulty_entry_1', 'difficulty_entry_2', 'difficulty_entry_3', 'KillCredit1', 'KillCredit2']),
    },
    { table: 'creature_queststarter', where: 'id = @ID' },
    { table: 'creature_questender', where: 'id = @ID' },
    { table: 'quest_template', where: any(numbered('RequiredNpcOrGo', 4)) },
    { table: 'npc_vendor', where: 'entry = @ID' },
    { table: 'creature_text', where: 'CreatureID = @ID' },
    { table: 'creature_template_spell', where: 'CreatureID = @ID' },
    { table: 'npc_spellclick_spells', where: 'npc_entry = @ID' },
    { table: 'vehicle_template_accessory', where: any(['entry', 'accessory_entry']) },
    // SMART_SCRIPT_TYPE_CREATURE, and SUMMON_CREATURE (12), CALL_KILLEDMONSTER (33), UPDATE_TEMPLATE (36), MOUNT_TO_ENTRY_OR_MODEL (43)
    { table: 'smart_scripts', where: `(source_type = 0 AND entryorguid = @ID) OR (${smartAction([12, 33, 36, 43])})` },
    // NEAR_CREATURE (29), OBJECT_ENTRY_GUID (31) of a unit (TypeID 3)
    {
      table: 'conditions',
      where: `${conditionValue([29])} OR (ConditionTypeOrReference = 31 AND ConditionValue1 = 3 AND ConditionValue2 = @ID)`,
    },
    // SCRIPT_COMMAND_TEMP_SUMMON_CREATURE (10)
    ...scriptTables(scriptCommand([10])),
  ],
  gameobject: [
    { table: 'gameobject', where: 'id = @ID' },
    { table: 'gameobject_queststarter', where: 'id = @ID' },
    { table: 'gameobject_questender', where: 'id = @ID' },
    {
      table: 'quest_template',
      where: numbered('RequiredNpcOrGo', 4)
        .map((column) => `\`${column}\` = -@ID`)
        .join(' OR '),
    },
    // SMART_SCRIPT_TYPE_GAMEOBJECT, and SUMMON_GO (50)
    { table: 'smart_scripts', where: `(source_type = 1 AND entryorguid = @ID) OR (${smartAction([50])})` },
    // NEAR_GAMEOBJECT (30), OBJECT_ENTRY_GUID (31) of a gameobject (TypeID 5)
    {
      table: 'conditions',
      where: `${conditionValue([30])} OR (ConditionTypeOrReference = 31 AND ConditionValue1 = 5 AND ConditionValue2 = @ID)`,
    },
  ],
  item: [
    ...lootTables,
    { table: 'npc_vendor', where: 'item = @ID' },
    {
      table: 'quest_template',
      where: any([
        'StartItem',
        ...numbered('RewardItem', 4),
        ...numbered('RewardChoiceItemID', 6),
        ...numbered('RequiredItemId', 6),
        ...numbered('ItemDrop', 4),
      ]),
    },
    // ADD_ITEM (56), REMOVE_ITEM (57)
    { table: 'smart_scripts', where: smartAction([56, 57]) },
    // CONDITION_ITEM (2), CONDITION_ITEM_EQUIPPED (3)
    { table: 'conditions', where: conditionValue([2, 3]) },
    // SCRIPT_COMMAND_CREATE_ITEM (17)
    ...scriptTables(scriptCommand([17])),
  ],
  quest: [
    { table: 'creature_queststarter', where: 'quest = @ID' },
    { table: 'creature_questender', where: 'quest = @ID' },
    { table: 'gameobject_queststarter', where: 'quest = @ID' },
    { table: 'gameobject_questender', where: 'quest = @ID' },
    { table: 'areatrigger_involvedrelation', where: 'quest = @ID' },
    { table: 'quest_template', where: 'RewardNextQuest = @ID' },
    { table: 'quest_template_addon', where: 'ABS(PrevQuestID) = @ID OR ABS(NextQuestID) = @ID OR BreadcrumbForQuestId = @ID' },
    { table: 'item_template', where: 'startquest = @ID' },
    { table: 'spell_area', where: any(['quest_start', 'quest_end']) },
    // OFFER_QUEST (7), CALL_AREAEXPLOREDOREVENTHAPPENS (15)
    { table: 'smart_scripts', where: smartAction([7, 15]) },
    // QUESTREWARDED (8), QUESTTAKEN (9), QUEST_NONE (14), QUEST_COMPLETE (28), QUESTSTATE (47)
    { table: 'conditions', where: conditionValue([8, 9, 14, 28, 47]) },
    // SCRIPT_COMMAND_QUEST_EXPLORED (7)
    ...scriptTables(scriptCommand([7])),
  ],
  spell: [
    { table: 'creature_template_spell', where: 'Spell = @ID' },
    { table: 'creature_template_addon', where: "FIND_IN_SET(@ID, REPLACE(TRIM(auras), ' ', ','))" },
    { table: 'creature_addon', where: "FIND_IN_SET(@ID, REPLACE(TRIM(auras), ' ', ','))" },
    { table: 'npc_spellclick_spells', where: 'spell_id = @ID' },
    { table: 'spell_area', where: any(['spell', 'aura_spell']) },
    { table: 'spell_linked_spell', where: 'ABS(spell_trigger) = @ID OR ABS(spell_effect) = @ID' },
    { table: 'spell_script_names', where: 'ABS(spell_id) = @ID' },
    { table: 'npc_trainer', where: 'SpellID = @ID' },
    { table: 'trainer_spell', where: 'SpellId = @ID' },
    { table: 'item_template', where: any(numbered('spellid_', 5)) },
    { table: 'quest_template', where: any(['RewardSpell', 'RewardDisplaySpell']) },
    { table: 'quest_template_addon', where: 'SourceSpellID = @ID' },
    // SPELLHIT (8); CAST (11), REMOVEAURASFROMSPELL (28), ADD_AURA (75), SELF_CAST (85), CROSS_CAST (86), INVOKER_CAST (134)
    { table: 'smart_scripts', where: `(event_type = 8 AND event_param1 = @ID) OR (${smartAction([11, 28, 75, 85, 86, 134])})` },
    // CONDITION_SOURCE_TYPE_SPELL (17); CONDITION_AURA (1), CONDITION_SPELL (25)
    { table: 'conditions', where: `(SourceTypeOrReferenceId = 17 AND SourceEntry = @ID) OR (${conditionValue([1, 25])})` },
    // DISABLE_TYPE_SPELL (0)
    { table: 'disables', where: 'sourceType = 0 AND entry = @ID' },
    // SCRIPT_COMMAND_REMOVE_AURA (14), SCRIPT_COMMAND_CAST_SPELL (15)
    ...scriptTables(scriptCommand([14, 15])),
  ],
  broadcastText: [
    { table: 'creature_text', where: 'BroadcastTextId = @ID' },
    { table: 'gossip_menu_option', where: any(['OptionBroadcastTextID', 'BoxBroadcastTextID']) },
    { table: 'npc_text', where: any(Array.from({ length: 8 }, (_, i) => `BroadcastTextID${i}`)) },
  ],
};

/** The rows of a table using an id: the id is an integer, so it goes in as it is. */
export function findQuery(reference: FindReference, id: number, limit = 50): string {
  return `SELECT * FROM \`${reference.table}\` WHERE ${reference.where.replace(/@ID/g, String(Math.trunc(id)))} LIMIT ${limit}`;
}
