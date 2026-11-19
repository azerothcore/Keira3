import { questXp } from './quest-xp';

describe('questXp (Quest::XPValue)', () => {
  it('gives the full amount up to 5 levels above the quest, then less, at least a tenth', () => {
    expect(questXp(1050, 10, 10)).toBe(1050);
    expect(questXp(1050, 10, 15)).toBe(1050);
    expect(questXp(1050, 10, 16)).toBe(850);
    expect(questXp(1050, 10, 40)).toBe(110);
  });

  it('rounds as the core does', () => {
    expect(questXp(87, 10, 10)).toBe(85);
    expect(questXp(423, 10, 10)).toBe(420);
    expect(questXp(988, 10, 10)).toBe(1000);
    expect(questXp(960, 10, 10)).toBe(950);
    expect(questXp(4777, 10, 10)).toBe(4800);
  });

  it('reads a quest level of -1 as the player level', () => {
    expect(questXp(2200, -1, 80)).toBe(2200);
  });
});
