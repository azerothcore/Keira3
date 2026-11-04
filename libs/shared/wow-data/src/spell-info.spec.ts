import { DbcFile } from './dbc';
import { buildDbc } from './dbc.mock';
import { findDbcRecord, parseSpellInfo } from './spell-info';
import { fireball, float, spellRow } from './spell-info.mock';

describe('parseSpellInfo', () => {
  const dbcs = () => ({
    spell: new DbcFile(buildDbc([spellRow({ 0: 1 }), fireball, spellRow({ 0: 200 })], 234)),
    castTimes: new DbcFile(buildDbc([[3, 1500, 0, 0]])),
    durations: new DbcFile(buildDbc([[5, 8000, 0, 8000]])),
    ranges: new DbcFile(buildDbc([[4, float(0), float(0), float(35), float(35), 0]])),
    radius: new DbcFile(buildDbc([[8, float(5), 0, float(5)]])),
  });

  it('reads a spell, its times, range and effects in words', () => {
    const info = parseSpellInfo(dbcs(), 133);

    expect(info).toMatchObject({
      id: 133,
      name: 'Fireball',
      rank: 'Rank 1',
      schoolMask: 4,
      manaCost: 30,
      castTime: 1500,
      duration: 8000,
      rangeMin: 0,
      rangeMax: 35,
      speed: 24,
    });
    expect(info?.effects).toEqual([
      expect.objectContaining({ index: 0, effectName: 'SCHOOL_DAMAGE', min: 14, max: 20, targetA: 'UNIT_TARGET_ENEMY', auraName: '' }),
      expect.objectContaining({
        index: 1,
        effectName: 'APPLY_AURA',
        aura: 3,
        auraName: 'PERIODIC_DAMAGE',
        min: 2,
        max: 2,
        amplitude: 2000,
        radius: 5,
      }),
    ]);
  });

  it('reads nothing of a spell it lacks, and zeros without the other tables', () => {
    expect(parseSpellInfo(dbcs(), 150)).toBeUndefined();
    expect(parseSpellInfo(dbcs(), 999)).toBeUndefined();
    const info = parseSpellInfo({ spell: dbcs().spell }, 133);
    expect([info?.castTime, info?.duration, info?.rangeMax, info?.effects[1].radius]).toEqual([0, 0, 0, 0]);
    expect(parseSpellInfo({ ...dbcs(), castTimes: new DbcFile(buildDbc([[9, 1]])) }, 133)?.castTime).toBe(0);
  });

  it('names an effect, aura or target it does not know by its number', () => {
    const odd = spellRow({ 0: 7, 71: 999, 95: 999, 86: 999 });
    const [effect] = parseSpellInfo({ spell: new DbcFile(buildDbc([odd], 234)) }, 7)?.effects ?? [];
    expect([effect.effectName, effect.auraName, effect.targetA, effect.targetB]).toEqual(['999', '999', '999', '']);
  });

  it('finds a record by id', () => {
    const dbc = new DbcFile(buildDbc([[1], [5], [9]]));
    expect([findDbcRecord(dbc, 1), findDbcRecord(dbc, 9), findDbcRecord(dbc, 4), findDbcRecord(dbc, 10)]).toEqual([0, 2, -1, -1]);
  });
});
