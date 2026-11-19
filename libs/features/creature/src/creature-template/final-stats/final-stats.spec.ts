import { finalStats, StatsTemplate } from './final-stats';

describe('finalStats', () => {
  const ragnaros: StatsTemplate = {
    exp: 0,
    unit_class: 1,
    HealthModifier: 330,
    ManaModifier: 1,
    ArmorModifier: 1,
    DamageModifier: 13,
    ExperienceModifier: 1,
    BaseAttackTime: 2000,
    BaseVariance: 1,
  };
  const row = {
    level: 63,
    basehp0: 3331,
    basehp1: 5527,
    basehp2: 1,
    basemana: 0,
    basearmor: 4641,
    attackpower: 268,
    damage_base: 35.775,
    damage_exp1: 71.4361,
    damage_exp2: 71.4361,
  };

  it("gives a creature's health, mana, armor and damage at a level, its modifiers applied (#3318)", () => {
    expect(finalStats(row, ragnaros)).toEqual({
      level: 63,
      health: 1099230,
      mana: 0,
      armor: 4641,
      minDamage: Math.round((35.775 + 268 / 14) * 13 * 2),
      maxDamage: Math.round((35.775 * 1.5 + 268 / 14) * 13 * 2),
      attackPower: 268,
    });
  });

  it('reads the columns of its expansion, mana when it has some, and defaults the attack time and variance', () => {
    const stats = finalStats({ ...row, basemana: 100 }, { ...ragnaros, exp: 2, ManaModifier: 1.5, BaseAttackTime: 0, BaseVariance: 0 });
    expect(stats.health).toBe(330);
    expect(stats.mana).toBe(150);
    expect(stats.minDamage).toBe(Math.round((71.4361 + 268 / 14) * 13 * 2));
    expect(finalStats(row, { ...ragnaros, exp: 1 }).health).toBe(5527 * 330);
    expect(finalStats(row, { ...ragnaros, exp: 9 }).health).toBe(330);
    expect(finalStats(row, { ...ragnaros, exp: NaN }).health).toBe(1099230);
  });
});
