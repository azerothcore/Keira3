import { LootTemplate } from './loot-template.type';

export const CREATURE_LOOT_TEMPLATE_TABLE = 'creature_loot_template';
// creature_loot_template is the only loot table whose primary key is (Entry, Item, Reference, GroupId):
// the same Item can appear once per Reference and GroupId (e.g. several Item 0 reference rows).
export const CREATURE_LOOT_TEMPLATE_EXTRA_IDS = ['Reference', 'GroupId'];
export class CreatureLootTemplate extends LootTemplate {}
