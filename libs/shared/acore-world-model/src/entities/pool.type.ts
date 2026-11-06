import { TableRow } from '@keira/shared/constants';

/** `pool_template`: a pool, spawning up to `max_limit` of its members at once (0: none, PoolGroup::SpawnObject). */
export const POOL_TEMPLATE_TABLE = 'pool_template';
export const POOL_TEMPLATE_ID = 'entry';
export const POOL_TEMPLATE_NAME = 'description';
export const POOL_TEMPLATE_SEARCH_FIELDS = [POOL_TEMPLATE_ID, 'max_limit', POOL_TEMPLATE_NAME];
export const POOL_TEMPLATE_CUSTOM_STARTING_ID = 100_000;

export class PoolTemplate extends TableRow {
  entry: number = 0;
  /** How many of its members are up at once (0 spawns none). */
  max_limit: number = 0;
  description: string = '';
}

/** A pool's creatures and gameobjects: their `guid` (unique in the table) and chance. */
export const POOL_CREATURE_TABLE = 'pool_creature';
export const POOL_GAMEOBJECT_TABLE = 'pool_gameobject';
export const POOL_MEMBER_ID = 'pool_entry';
export const POOL_MEMBER_ID_2 = 'guid';

export class PoolCreature extends TableRow {
  guid: number = 0;
  pool_entry: number = 0;
  /** The chance (%) it is the one spawned, when the pool spawns one at a time (0: an equal share of what's left). */
  chance: number = 0;
  description: string = '';
}

export class PoolGameobject extends PoolCreature {}

/** `pool_pool`: the pools in a mother pool (`mother_pool`), each a member like a spawn. */
export const POOL_POOL_TABLE = 'pool_pool';
export const POOL_POOL_ID = 'mother_pool';
export const POOL_POOL_ID_2 = 'pool_id';

export class PoolPool extends TableRow {
  pool_id: number = 0;
  mother_pool: number = 0;
  chance: number = 0;
  description: string = '';
}

/** `pool_quest`: daily or weekly quests offered in turn. */
export const POOL_QUEST_TABLE = 'pool_quest';
export const POOL_QUEST_ID = 'pool_entry';
export const POOL_QUEST_ID_2 = 'entry';

export class PoolQuest extends TableRow {
  entry: number = 0;
  pool_entry: number = 0;
  description: string = '';
}

/** `game_event_pool`: the event a pool spawns during (negative: the pool is removed during it). */
export const GAME_EVENT_POOL_TABLE = 'game_event_pool';
export const GAME_EVENT_POOL_ID = 'pool_entry';
export const GAME_EVENT_POOL_ID_2 = 'eventEntry';

export class GameEventPool extends TableRow {
  eventEntry: number = 0;
  pool_entry: number = 0;
}
