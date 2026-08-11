/** How one quest leads to another. */
export type QuestChainEdgeKind =
  /** `PrevQuestID` > 0 / `NextQuestID`: the source must be *completed* before the target. */
  | 'chain'
  /** `PrevQuestID` < 0: the source must merely be *available* for the target to appear. */
  | 'enabled-by'
  /** `BreadcrumbForQuestId`: the source is an optional quest that points the player toward the target. */
  | 'breadcrumb';

/** Semantics of an `ExclusiveGroup` value. */
export type QuestChainGroupKind =
  /** Positive group: taking one quest of the group locks out the others. */
  | 'any'
  /** Negative group: every quest of the group must be completed. */
  | 'all';

export interface QuestChainNode {
  id: number;
  /** Empty when the quest has no `quest_template` row — see `missing`. */
  title: string;
  /** Referenced by the chain but absent from `quest_template`: a broken link worth showing rather than hiding. */
  missing: boolean;
  /** The quest currently open in the editor. */
  isCurrent: boolean;
  exclusiveGroup: number;
  /** `conditions` rows of source type 19 gating this quest's availability. 0 means none. */
  conditionCount: number;
  depth: number;
  x: number;
  y: number;
}

export interface QuestChainEdge {
  from: number;
  to: number;
  kind: QuestChainEdgeKind;
}

/** An edge with its SVG path pre-computed, so the template stays free of geometry. */
export interface QuestChainRenderEdge extends QuestChainEdge {
  path: string;
}

/** A box drawn around the members of one `ExclusiveGroup`, instead of one edge per member pair. */
export interface QuestChainGroupBand {
  group: number;
  /** The caption is built from this in the template, so it goes through i18n like every other string. */
  kind: QuestChainGroupKind;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuestChainGraph {
  nodes: QuestChainNode[];
  edges: QuestChainRenderEdge[];
  bands: QuestChainGroupBand[];
  width: number;
  height: number;
  /** True when expansion hit the node budget, so the graph shown is only part of the real chain. */
  truncated: boolean;
}

/** A quest discovered during expansion, before layout. */
export interface QuestChainEntry {
  id: number;
  title: string;
  missing: boolean;
  exclusiveGroup: number;
  conditionCount: number;
}

export const EMPTY_QUEST_CHAIN_GRAPH: QuestChainGraph = {
  nodes: [],
  edges: [],
  bands: [],
  width: 0,
  height: 0,
  truncated: false,
};
