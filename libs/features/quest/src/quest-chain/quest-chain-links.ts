/** The columns of quest_template_addon that chain a quest to others. */
export const CHAIN_LINK_FIELDS = ['PrevQuestID', 'NextQuestID', 'ExclusiveGroup', 'BreadcrumbForQuestId'] as const;
export type ChainLinkField = (typeof CHAIN_LINK_FIELDS)[number];
export type ChainLinks = Record<ChainLinkField, number>;

export const NO_CHAIN_LINKS: ChainLinks = { PrevQuestID: 0, NextQuestID: 0, ExclusiveGroup: 0, BreadcrumbForQuestId: 0 };

/**
 * The SQL setting a quest's chain links: its quest_template_addon row inserted when it has none, else the changed
 * columns updated; empty when nothing changed.
 */
export function chainLinksQuery(questId: number, before: ChainLinks, after: ChainLinks): string {
  const changed = CHAIN_LINK_FIELDS.filter((field) => Number(before[field]) !== Number(after[field]));
  if (!changed.length) {
    return '';
  }
  const value = (field: ChainLinkField) => Math.trunc(Number(after[field]) || 0);
  return (
    `INSERT INTO \`quest_template_addon\` (\`ID\`, ${changed.map((field) => `\`${field}\``).join(', ')}) VALUES ` +
    `(${Math.trunc(questId)}, ${changed.map(value).join(', ')})\n` +
    `  ON DUPLICATE KEY UPDATE ${changed.map((field) => `\`${field}\` = VALUES(\`${field}\`)`).join(', ')};`
  );
}
