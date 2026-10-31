import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';

/**
 * Checks of a SmartAI script, as AzerothCore's SmartAIMgr makes when it loads it (skipping the rows it refuses), and
 * rows that will never run.
 */

/** A problem with some rows of a script (an i18n key under `SMARTAI.CHECK.`, and the ids of the rows). */
export interface SaiProblem {
  key: string;
  ids: number[];
}

/** SmartEvent types timed by InitialMin, InitialMax, RepeatMin, RepeatMax (UPDATE_IC, UPDATE_OOC, UPDATE). */
const TIMED_EVENTS = [0, 1, 60];
const SMART_EVENT_LINK = 61;
/** SMART_EVENT_PHASE_MAX (phases 1 to 12) and SMART_EVENT_PHASE_ALL. */
const PHASE_MAX = 13;
const PHASE_ALL = 0xfff;
/** Actions setting the event phase: SET_EVENT_PHASE, INC_EVENT_PHASE, RANDOM_PHASE, RANDOM_PHASE_RANGE. */
const PHASE_ACTIONS = [22, 23, 30, 31];
const SET_EVENT_PHASE = 22;
const INC_EVENT_PHASE = 23;
const CALL_TIMED_ACTIONLIST = 80;

export function checkSmartScripts(rows: SmartScripts[]): SaiProblem[] {
  const problems = new Map<string, number[]>();
  const add = (key: string, row: SmartScripts) => problems.set(key, [...(problems.get(key) ?? []), row.id]);
  const ids = new Set(rows.map((row) => row.id));
  const linked = new Set(rows.filter((row) => row.link).map((row) => row.link));
  const setsPhase = rows.some((row) => PHASE_ACTIONS.includes(row.action_type));

  for (const row of rows) {
    // (a timed actionlist's rows are all timed, whatever their event)
    const timed = row.source_type === SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST || TIMED_EVENTS.includes(row.event_type);
    if (timed && (row.event_param1 > row.event_param2 || row.event_param3 > row.event_param4)) {
      add('MIN_MAX', row);
    }
    if (row.event_phase_mask > PHASE_ALL) {
      add('PHASE_MASK', row);
    } else if (row.event_phase_mask && !setsPhase) {
      add('PHASE_NEVER_SET', row);
    }
    if (Number(row.event_chance) === 0) {
      add('CHANCE_ZERO', row);
    }
    if (row.link && row.link === row.id) {
      add('LINK_SELF', row);
    } else if (row.link && !ids.has(row.link)) {
      add('LINK_MISSING', row);
    } else if (row.link && rows.find((other) => other.id === row.link)?.event_type !== SMART_EVENT_LINK) {
      add('LINK_NOT_LINK_EVENT', row);
    }
    if (row.event_type === SMART_EVENT_LINK && row.source_type !== SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST && !linked.has(row.id)) {
      add('LINK_ORPHAN', row);
    }
    if (row.action_type === SET_EVENT_PHASE && row.action_param1 >= PHASE_MAX) {
      add('SET_PHASE_RANGE', row);
    }
    if (row.action_type === INC_EVENT_PHASE && !row.action_param1 && !row.action_param2) {
      add('INC_PHASE_ZERO', row);
    }
    if (row.action_type === CALL_TIMED_ACTIONLIST && !row.action_param1) {
      add('ACTIONLIST_ZERO', row);
    }
  }
  return [...problems].map(([key, ids]) => ({ key, ids }));
}
