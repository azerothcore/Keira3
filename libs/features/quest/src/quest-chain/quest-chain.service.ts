import { inject, Service } from '@angular/core';
import { QuestChainRelationRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { QuestHandlerService } from '../quest-handler.service';
import { buildQuestChainGraph } from './quest-chain.layout';
import { EMPTY_QUEST_CHAIN_GRAPH, QuestChainEdge, QuestChainEntry, QuestChainGraph } from './quest-chain.model';

/** Upper bound on quests drawn. Hit only by pathological data; the view says so when it trips. */
export const MAX_QUEST_CHAIN_NODES = 80;
/** Upper bound on frontier expansions, so malformed cyclic data cannot loop forever. */
export const MAX_QUEST_CHAIN_ROUNDS = 25;

@Service()
export class QuestChainService {
  private readonly mysqlQueryService = inject(MysqlQueryService);
  private readonly questHandlerService = inject(QuestHandlerService);

  get selectedId(): number {
    return Number(this.questHandlerService.selected);
  }

  /**
   * Walks outwards from the selected quest and returns a laid-out graph.
   *
   * Expansion is breadth-first by *level* rather than by node: each round issues one query covering the whole
   * frontier, so a wide chain costs a handful of round trips instead of one per quest.
   */
  async buildGraph(): Promise<QuestChainGraph> {
    const rootId = this.selectedId;

    if (!Number.isSafeInteger(rootId) || rootId <= 0) {
      return { ...EMPTY_QUEST_CHAIN_GRAPH };
    }

    // Every query below is cached by the db layer, so without this the Reload button would only redraw
    // the graph it already has. Editors do the same on entry.
    this.mysqlQueryService.clearCache();

    const relations = new Map<number, QuestChainRelationRow>();
    const known = new Set<number>([rootId]);
    const requestedIds = new Set<number>();
    const requestedGroups = new Set<number>();

    let frontierIds: number[] = [rootId];
    let frontierGroups: number[] = [];

    for (let round = 0; round < MAX_QUEST_CHAIN_ROUNDS; round++) {
      if (frontierIds.length === 0 && frontierGroups.length === 0) {
        break;
      }

      for (const id of frontierIds) {
        requestedIds.add(id);
      }
      for (const group of frontierGroups) {
        requestedGroups.add(group);
      }

      const rows = await this.mysqlQueryService.getQuestChainRelations(frontierIds, frontierGroups);

      for (const row of rows) {
        relations.set(Number(row.ID), row);
      }

      for (const id of this.collectReferencedIds(rows)) {
        known.add(id);
      }

      if (known.size > MAX_QUEST_CHAIN_NODES) {
        break;
      }

      frontierIds = [...known].filter((id) => !requestedIds.has(id));
      frontierGroups = [...relations.values()]
        .map((row) => Number(row.ExclusiveGroup))
        .filter((group) => group !== 0 && !requestedGroups.has(group));
      // Deduplicate, otherwise a group shared by many quests is queried once per member.
      frontierGroups = [...new Set(frontierGroups)];
    }

    // A single round can take `known` well past the budget, so cap what actually gets laid out - the
    // layout is O(nodes x edges) and would otherwise freeze the view on exactly the data the cap names.
    // `known` is in walk order, so this keeps the selected quest and its closest neighbours.
    const ids = [...known].slice(0, MAX_QUEST_CHAIN_NODES);
    // Either cap can stop the walk early, and so can the round limit with a frontier still queued.
    const truncated = ids.length < known.size || frontierIds.length > 0 || frontierGroups.length > 0;

    const [titles, conditionCounts] = await Promise.all([
      this.mysqlQueryService.getQuestTitlesByIds(ids),
      this.mysqlQueryService.getQuestConditionCounts(ids),
    ]);
    const titleById = new Map(titles.map((row) => [Number(row.ID), String(row.LogTitle ?? '')]));
    const conditionsById = new Map(conditionCounts.map((row) => [Number(row.SourceEntry), Number(row.conditionCount)]));

    const entries: QuestChainEntry[] = ids.map((id) => ({
      id,
      title: titleById.get(id) ?? '',
      // No quest_template row: the chain points at a quest that is not there. Worth showing, not hiding.
      missing: !titleById.has(id),
      exclusiveGroup: Number(relations.get(id)?.ExclusiveGroup ?? 0),
      conditionCount: conditionsById.get(id) ?? 0,
    }));

    return buildQuestChainGraph(entries, this.buildEdges(relations), rootId, truncated);
  }

  /** Every quest id mentioned by a batch of addon rows, including the rows' own ids. */
  private collectReferencedIds(rows: QuestChainRelationRow[]): number[] {
    const ids: number[] = [];

    for (const row of rows) {
      // A negative PrevQuestID still names a real quest; the sign only carries the "enabled by" meaning.
      for (const value of [row.ID, Math.abs(Number(row.PrevQuestID)), row.NextQuestID, row.BreadcrumbForQuestId]) {
        const id = Number(value);

        if (id > 0) {
          ids.push(id);
        }
      }
    }

    return ids;
  }

  private buildEdges(relations: Map<number, QuestChainRelationRow>): QuestChainEdge[] {
    const edges: QuestChainEdge[] = [];
    const seen = new Set<string>();

    const add = (from: number, to: number, kind: QuestChainEdge['kind']): void => {
      const key = `${from}|${to}|${kind}`;

      // `to` is 0 when the column is unset. The same link is often stated twice
      // (X.NextQuestID = Y and Y.PrevQuestID = X); draw it once.
      if (to > 0 && !seen.has(key)) {
        seen.add(key);
        edges.push({ from, to, kind });
      }
    };

    for (const row of relations.values()) {
      const id = Number(row.ID);
      const prev = Number(row.PrevQuestID);

      if (prev > 0) {
        add(prev, id, 'chain');
      } else if (prev < 0) {
        add(-prev, id, 'enabled-by');
      }

      add(id, Number(row.NextQuestID), 'chain');
      add(id, Number(row.BreadcrumbForQuestId), 'breadcrumb');
    }

    return edges;
  }
}
