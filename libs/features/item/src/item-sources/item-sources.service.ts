import { inject, Injectable } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { firstValueFrom } from 'rxjs';

/** A loot row having the item (not through a reference), and what uses that loot. */
export interface ItemLootSource {
  lootTable: string;
  Entry: number;
  Chance: number;
  QuestRequired: number;
  GroupId: number;
  MinCount: number;
  MaxCount: number;
  /** What uses the loot ("entry name, …"), when it can be told (creatures, gameobjects, items). */
  usedBy: string | null;
}

/** A loot table row pointing to a reference loot having the item. */
export interface ItemReferenceUser {
  lootTable: string;
  Entry: number;
  Reference: number;
}

export interface ItemVendor {
  entry: number;
  name: string | null;
  maxcount: number;
  ExtendedCost: number;
}

export interface ItemQuest {
  ID: number;
  LogTitle: string | null;
  kind: 'reward' | 'choice' | 'required' | 'start' | 'drop';
}

export interface ItemSources {
  loot: ItemLootSource[];
  referenceUsers: ItemReferenceUser[];
  vendors: ItemVendor[];
  quests: ItemQuest[];
}

const names = (from: string, where: string): string =>
  `(SELECT GROUP_CONCAT(CONCAT(\`u\`.\`entry\`, ' ', \`u\`.\`name\`) ORDER BY \`u\`.\`entry\` SEPARATOR ', ') FROM \`${from}\` \`u\` WHERE ${where})`;

/** The loot tables, and how to tell what uses each one's Entry. */
export const ITEM_LOOT_TABLES: { table: string; usedBy: string | null }[] = [
  { table: 'creature_loot_template', usedBy: names('creature_template', '`u`.`lootid` = `l`.`Entry`') },
  { table: 'pickpocketing_loot_template', usedBy: names('creature_template', '`u`.`pickpocketloot` = `l`.`Entry`') },
  { table: 'skinning_loot_template', usedBy: names('creature_template', '`u`.`skinloot` = `l`.`Entry`') },
  // (chests and fishing holes: their Data1 is the loot)
  { table: 'gameobject_loot_template', usedBy: names('gameobject_template', '`u`.`type` IN (3, 25) AND `u`.`Data1` = `l`.`Entry`') },
  { table: 'item_loot_template', usedBy: names('item_template', '`u`.`entry` = `l`.`Entry`') },
  { table: 'disenchant_loot_template', usedBy: names('item_template', '`u`.`DisenchantID` = `l`.`Entry`') },
  { table: 'prospecting_loot_template', usedBy: names('item_template', '`u`.`entry` = `l`.`Entry`') },
  { table: 'milling_loot_template', usedBy: names('item_template', '`u`.`entry` = `l`.`Entry`') },
  { table: 'fishing_loot_template', usedBy: null },
  { table: 'mail_loot_template', usedBy: null },
  { table: 'spell_loot_template', usedBy: null },
  { table: 'reference_loot_template', usedBy: null },
];

/**
 * Where an item comes from (#97, #731): the loot tables having it (and what drops them), the loot tables using the
 * reference loots having it, the vendors selling it, the quests giving, asking or starting with it.
 */
@Injectable({ providedIn: 'root' })
export class ItemSourcesService {
  private readonly queryService = inject(MysqlQueryService);

  async load(itemId: number | string): Promise<ItemSources> {
    const id = Number(itemId);
    const loot = await this.rows<ItemLootSource>(
      ITEM_LOOT_TABLES.map(
        ({ table, usedBy }) =>
          `SELECT '${table}' AS \`lootTable\`, \`l\`.\`Entry\`, \`l\`.\`Chance\`, \`l\`.\`QuestRequired\`, \`l\`.\`GroupId\`, ` +
          `\`l\`.\`MinCount\`, \`l\`.\`MaxCount\`, ${usedBy ?? 'NULL'} AS \`usedBy\` ` +
          `FROM \`${table}\` \`l\` WHERE \`l\`.\`Item\` = ${id} AND \`l\`.\`Reference\` = 0`,
      ).join(' UNION ALL '),
    );
    const references = [...new Set(loot.filter((row) => row.lootTable === 'reference_loot_template').map((row) => Number(row.Entry)))];
    const referenceUsers = references.length
      ? await this.rows<ItemReferenceUser>(
          ITEM_LOOT_TABLES.map(
            ({ table }) =>
              `SELECT '${table}' AS \`lootTable\`, \`Entry\`, \`Reference\` FROM \`${table}\` WHERE \`Reference\` IN (${references.join(', ')})`,
          ).join(' UNION ALL '),
        )
      : [];
    const vendors = await this.rows<ItemVendor>(
      'SELECT `v`.`entry`, `c`.`name`, `v`.`maxcount`, `v`.`ExtendedCost` FROM `npc_vendor` `v` ' +
        `LEFT JOIN \`creature_template\` \`c\` ON \`c\`.\`entry\` = \`v\`.\`entry\` WHERE \`v\`.\`item\` = ${id} ORDER BY \`v\`.\`entry\``,
    );
    const quest = (kind: ItemQuest['kind'], columns: string[]): string =>
      `SELECT \`ID\`, \`LogTitle\`, '${kind}' AS \`kind\` FROM \`quest_template\` WHERE ${id} IN (${columns.map((column) => `\`${column}\``).join(', ')})`;
    const range = (name: string, count: number): string[] => Array.from({ length: count }, (_, i) => `${name}${i + 1}`);
    const quests = await this.rows<ItemQuest>(
      [
        quest('reward', range('RewardItem', 4)),
        quest('choice', range('RewardChoiceItemID', 6)),
        quest('required', range('RequiredItemId', 6)),
        quest('start', ['StartItem']),
        quest('drop', range('ItemDrop', 4)),
      ].join(' UNION ALL '),
    );
    return { loot, referenceUsers, vendors, quests };
  }

  private async rows<T>(sql: string): Promise<T[]> {
    return ((await firstValueFrom(this.queryService.query<TableRow>(sql))) ?? []) as T[];
  }
}
