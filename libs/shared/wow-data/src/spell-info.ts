import { DbcFile } from './dbc';
import { localized } from './game-map';
import { SPELL_AURA_NAMES, SPELL_EFFECT_NAMES, SPELL_TARGET_NAMES } from './spell-enums';

/**
 * A spell as the client's Spell.dbc tells it (field numbers of AzerothCore's DBCStructure.h SpellEntry): what it costs,
 * how long it takes and lasts, how far it reaches, and its three effects, in words where they have names.
 */
export interface SpellEffectInfo {
  index: number;
  effect: number;
  effectName: string;
  aura: number;
  auraName: string;
  /** EffectBasePoints, plus 1 to EffectDieSides when it has dice (what the effect does, before modifiers). */
  min: number;
  max: number;
  targetA: string;
  targetB: string;
  radius: number;
  amplitude: number;
  chainTargets: number;
  item: number;
  miscValue: number;
  miscValueB: number;
  triggerSpell: number;
}

export interface SpellInfo {
  id: number;
  name: string;
  rank: string;
  schoolMask: number;
  powerType: number;
  manaCost: number;
  manaCostPercentage: number;
  /** In milliseconds; −1 for an infinite duration, 0 for none. */
  castTime: number;
  duration: number;
  cooldown: number;
  categoryCooldown: number;
  rangeMin: number;
  rangeMax: number;
  speed: number;
  stackAmount: number;
  procChance: number;
  procCharges: number;
  maxAffectedTargets: number;
  spellLevel: number;
  maxLevel: number;
  effects: SpellEffectInfo[];
}

/** The tables a spell's numbers are read from. */
export interface SpellDbcs {
  spell: DbcFile;
  castTimes?: DbcFile;
  durations?: DbcFile;
  ranges?: DbcFile;
  radius?: DbcFile;
}

/** The record of an id in a DBC sorted by id (as the client's are), or −1. */
export function findDbcRecord(dbc: DbcFile, id: number): number {
  let [low, high] = [0, dbc.recordCount - 1];
  while (low <= high) {
    const middle = (low + high) >> 1;
    const value = dbc.getUint(middle, 0);
    if (value === id) {
      return middle;
    }
    if (value < id) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}

/** Field `field` of the row `id` of an auxiliary DBC (0 when it has no such row). */
function lookup(dbc: DbcFile | undefined, id: number, read: (dbc: DbcFile, record: number) => number): number {
  if (!dbc || !id) {
    return 0;
  }
  const record = findDbcRecord(dbc, id);
  return record < 0 ? 0 : read(dbc, record);
}

const named = (names: Record<number, string>, id: number): string => (id ? (names[id] ?? String(id)) : '');

export function parseSpellInfo(dbcs: SpellDbcs, id: number): SpellInfo | undefined {
  const { spell } = dbcs;
  const r = findDbcRecord(spell, id);
  if (r < 0) {
    return undefined;
  }
  const u = (field: number) => spell.getUint(r, field);
  const i = (field: number) => spell.getInt(r, field);
  const effects: SpellEffectInfo[] = [];
  for (let e = 0; e < 3; e++) {
    const effect = u(71 + e);
    if (!effect) {
      continue;
    }
    const [base, dieSides] = [i(80 + e), i(74 + e)];
    effects.push({
      index: e,
      effect,
      effectName: named(SPELL_EFFECT_NAMES, effect),
      aura: u(95 + e),
      auraName: named(SPELL_AURA_NAMES, u(95 + e)),
      // (SpellEffectInfo::CalcValue: no dice adds nothing, else 1 to DieSides)
      min: dieSides ? base + Math.min(1, dieSides) : base,
      max: dieSides ? base + Math.max(1, dieSides) : base,
      targetA: named(SPELL_TARGET_NAMES, u(86 + e)),
      targetB: named(SPELL_TARGET_NAMES, u(89 + e)),
      // (SpellRadius.dbc: 1 RadiusMin)
      radius: lookup(dbcs.radius, u(92 + e), (dbc, record) => dbc.getFloat(record, 1)),
      amplitude: u(98 + e),
      chainTargets: u(104 + e),
      item: u(107 + e),
      miscValue: i(110 + e),
      miscValueB: i(113 + e),
      triggerSpell: u(116 + e),
    });
  }
  return {
    id,
    name: localized(spell, r, 136),
    rank: localized(spell, r, 153),
    schoolMask: u(225),
    // (signed: POWER_HEALTH is −2)
    powerType: i(41),
    manaCost: u(42),
    manaCostPercentage: u(204),
    // (SpellCastTimes.dbc: 1 CastTime; SpellDuration.dbc: 1 Duration; SpellRange.dbc: 1 RangeMin, 3 RangeMax)
    castTime: lookup(dbcs.castTimes, u(28), (dbc, record) => dbc.getInt(record, 1)),
    duration: lookup(dbcs.durations, u(40), (dbc, record) => dbc.getInt(record, 1)),
    cooldown: u(29),
    categoryCooldown: u(30),
    rangeMin: lookup(dbcs.ranges, u(46), (dbc, record) => dbc.getFloat(record, 1)),
    rangeMax: lookup(dbcs.ranges, u(46), (dbc, record) => dbc.getFloat(record, 3)),
    speed: spell.getFloat(r, 47),
    stackAmount: u(49),
    procChance: u(35),
    procCharges: u(36),
    maxAffectedTargets: u(212),
    spellLevel: u(39),
    maxLevel: u(37),
    effects,
  };
}
