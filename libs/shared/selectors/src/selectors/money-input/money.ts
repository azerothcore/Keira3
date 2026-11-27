export const COPPER_PER_SILVER = 100;
export const COPPER_PER_GOLD = 10000;

export type Coin = 'gold' | 'silver' | 'copper';

export interface Money {
  gold: number;
  silver: number;
  copper: number;
}

export function toInteger(value: unknown): number {
  const num = Math.trunc(Number(value));
  return Number.isFinite(num) ? num : 0;
}

export function splitMoney(copper: number): Money {
  const total = Math.abs(toInteger(copper));
  return {
    gold: Math.floor(total / COPPER_PER_GOLD),
    silver: Math.floor((total % COPPER_PER_GOLD) / COPPER_PER_SILVER),
    copper: total % COPPER_PER_SILVER,
  };
}

export function joinMoney({ gold, silver, copper }: Money): number {
  return gold * COPPER_PER_GOLD + silver * COPPER_PER_SILVER + copper;
}
