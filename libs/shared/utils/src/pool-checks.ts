/**
 * What AzerothCore's PoolMgr says about a pool's members when the world server loads them (and then skips them, or
 * the whole pool): chances out of 0–100, explicit chances not adding up to 100, chances that do nothing.
 */

/** A problem with a pool (an i18n key under `POOLS.PROBLEM_`, and its values). */
export interface PoolProblem {
  key: string;
  params?: Record<string, string | number>;
}

/** The gameobject types a pool can hold (chests, goobers and fishing holes: what can be looted). */
export const POOLED_GAMEOBJECT_TYPES = [3, 10, 25];

/**
 * The problems of the members' chances. Only a pool spawning one member at a time (`max_limit` 1) uses them: each
 * member with a chance gets that chance (PoolGroup::AddEntry), the ones with 0 share what's left. With none at 0, the
 * chances must add up to 100 (or all be 0), else the pool doesn't spawn (PoolGroup::CheckPool).
 */
export function chanceProblems(all: number[], maxLimit: number): PoolProblem[] {
  const problems: PoolProblem[] = [];
  if (maxLimit === 0 && all.length) {
    problems.push({ key: 'MAX_LIMIT_ZERO' });
  }
  const outside = all.filter((chance) => chance < 0 || chance > 100);
  if (outside.length) {
    problems.push({ key: 'CHANCE_RANGE', params: { count: outside.length } });
  }
  // (the world server skips the members out of 0–100: they aren't in the pool)
  const chances = all.filter((chance) => chance >= 0 && chance <= 100);
  const explicit = chances.filter((chance) => chance !== 0);
  if (!explicit.length || maxLimit === 0) {
    return problems;
  }
  if (maxLimit > 1) {
    problems.push({ key: 'CHANCE_IGNORED', params: { max: maxLimit } });
    return problems;
  }
  const sum = Math.round(explicit.reduce((total, chance) => total + chance, 0) * 100) / 100;
  const equal = chances.length - explicit.length;
  if (!equal && sum !== 100) {
    problems.push({ key: 'CHANCE_SUM', params: { sum } });
  } else if (equal && sum >= 100) {
    problems.push({ key: 'CHANCE_EQUAL_NEVER', params: { sum, count: equal } });
  }
  return problems;
}
