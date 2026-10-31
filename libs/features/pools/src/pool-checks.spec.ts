import { chanceProblems } from './pool-checks';

describe('chanceProblems', () => {
  it('finds chances out of 0–100', () => {
    // (those are skipped: the one left at 0 spawns)
    expect(chanceProblems([-1, 150, 0], 1)).toEqual([{ key: 'CHANCE_RANGE', params: { count: 2 } }]);
  });

  it('says a pool with max_limit 0 spawns nothing', () => {
    expect(chanceProblems([], 0)).toEqual([]);
    expect(chanceProblems([0, 50], 0)).toEqual([{ key: 'MAX_LIMIT_ZERO' }]);
  });

  it('says chances do nothing unless the pool spawns one at a time', () => {
    expect(chanceProblems([0, 0], 2)).toEqual([]);
    expect(chanceProblems([50], 0)).toEqual([{ key: 'MAX_LIMIT_ZERO' }]);
    expect(chanceProblems([50, 0], 2)).toEqual([{ key: 'CHANCE_IGNORED', params: { max: 2 } }]);
  });

  it('wants explicit chances adding up to 100, and room for the equal ones', () => {
    expect(chanceProblems([], 1)).toEqual([]);
    expect(chanceProblems([60, 40], 1)).toEqual([]);
    expect(chanceProblems([33.33, 33.33, 33.34], 1)).toEqual([]);
    expect(chanceProblems([60, 30], 1)).toEqual([{ key: 'CHANCE_SUM', params: { sum: 90 } }]);
    expect(chanceProblems([60, 0], 1)).toEqual([]);
    expect(chanceProblems([60, 40, 0, 0], 1)).toEqual([{ key: 'CHANCE_EQUAL_NEVER', params: { sum: 100, count: 2 } }]);
  });
});
