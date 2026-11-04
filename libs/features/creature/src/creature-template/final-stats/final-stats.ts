import { TableRow } from '@keira/shared/constants';

/** What the final stats need from creature_template. */
export interface StatsTemplate {
  exp: number;
  unit_class: number;
  HealthModifier: number;
  ManaModifier: number;
  ArmorModifier: number;
  DamageModifier: number;
  ExperienceModifier: number;
  BaseAttackTime: number;
  BaseVariance: number;
}

export interface FinalStats {
  level: number;
  health: number;
  mana: number;
  armor: number;
  minDamage: number;
  maxDamage: number;
  attackPower: number;
}

/**
 * A creature's stats at a level as the core makes them (`CreatureBaseStats::Generate*`, `Creature::CalculateMinMaxDamage`)
 * from its creature_classlevelstats row: health basehp<exp> × HealthModifier, mana and armor by their modifiers (rounded
 * up), and its melee damage before auras: (damage + attack power / 14 × BaseVariance) × DamageModifier × attack time
 * in seconds, the maximum from 1.5 × the damage (#3318).
 */
export function finalStats(row: TableRow, template: StatsTemplate): FinalStats {
  const exp = Math.min(2, Math.max(0, Number(template.exp) || 0));
  const health = Math.ceil(Number(row[`basehp${exp}`]) * Number(template.HealthModifier));
  const mana = Number(row['basemana']) ? Math.ceil(Number(row['basemana']) * Number(template.ManaModifier)) : 0;
  const armor = Math.ceil(Number(row['basearmor']) * Number(template.ArmorModifier));
  const damage = Number(row[exp === 0 ? 'damage_base' : `damage_exp${exp}`]);
  const attackPower = Number(row['attackpower']);
  const fromPower = (attackPower / 14) * Number(template.BaseVariance || 1);
  const speed = (Number(template.BaseAttackTime) || 2000) / 1000;
  const scale = Number(template.DamageModifier) * speed;
  return {
    level: Number(row['level']),
    health,
    mana,
    armor,
    minDamage: Math.round((damage + fromPower) * scale),
    maxDamage: Math.round((damage * 1.5 + fromPower) * scale),
    attackPower,
  };
}
