import { WeatherKind, WorldWeather } from '@keira/shared/world-viewer';

/** Seasons as the server counts them (WeatherSeason). */
export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

/** A game_weather row: the chance (%) of rain, snow and a (sand)storm in each season. */
export type WeatherChances = Record<Season, Record<WeatherKind, number>>;

/** The season of a date, like the server: spring from day 77 of the year counted from 0 (about March 19), 91 days each. */
export function seasonOf(date: Date): Season {
  const dayOfYear = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 1)) / 86_400_000,
  );
  return SEASONS[Math.floor((dayOfYear - 78 + 365) / 91) % 4];
}

/**
 * Rolls the weather like the server (Weather::ReGenerate): a roll of 1..100 against rain, then snow, then storm
 * chances in turn; above them all, fine weather (undefined). The grade (intensity) is random.
 */
export function rollWeather(chances: WeatherChances, season: Season, random: () => number = Math.random): WorldWeather | undefined {
  const roll = Math.floor(random() * 100) + 1;
  let total = 0;
  for (const kind of ['rain', 'snow', 'storm'] as WeatherKind[]) {
    total += chances[season][kind];
    if (roll <= total) {
      return { kind, intensity: Math.max(0.1, random()) };
    }
  }
  return undefined;
}
