import { TableRow } from './general';

/** Relationship fields of a single `quest_template_addon` row, used to expand a quest chain. */
export interface QuestChainRelationRow extends TableRow {
  ID: number;
  /** Positive: the quest that must be completed first. Negative: the quest that must merely be available ("enabled by"). */
  PrevQuestID: number;
  NextQuestID: number;
  /** Positive: only one quest of the group may be taken. Negative: every quest of the group must be completed. */
  ExclusiveGroup: number;
  /** This quest is an optional breadcrumb leading the player to the quest with this id. */
  BreadcrumbForQuestId: number;
}

/** Title lookup row from `quest_template`. A quest referenced by a chain but absent here is a broken reference. */
export interface QuestTitleRow extends TableRow {
  ID: number;
  LogTitle: string;
}

/** Number of `conditions` rows gating one quest's availability. */
export interface QuestConditionCountRow extends TableRow {
  SourceEntry: number;
  conditionCount: number;
}

/** Number of `conditions` rows gating one `smart_scripts` event. `SourceGroup` is the event id + 1. */
export interface SmartEventConditionCountRow extends TableRow {
  SourceGroup: number;
  conditionCount: number;
}
