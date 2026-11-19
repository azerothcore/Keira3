import { rollWeather, seasonOf, WeatherChances } from './weather';

const CHANCES: WeatherChances = {
  spring: { rain: 20, snow: 0, storm: 0 },
  summer: { rain: 5, snow: 0, storm: 10 },
  fall: { rain: 30, snow: 10, storm: 0 },
  winter: { rain: 0, snow: 100, storm: 0 },
};

describe('weather', () => {
  it('tells the season like the server', () => {
    expect(seasonOf(new Date(2026, 2, 18))).toBe('winter');
    expect(seasonOf(new Date(2026, 2, 19))).toBe('spring');
    expect(seasonOf(new Date(2026, 6, 1))).toBe('summer');
    expect(seasonOf(new Date(2026, 9, 28))).toBe('fall');
    expect(seasonOf(new Date(2026, 0, 1))).toBe('winter');
    expect(seasonOf(new Date(2026, 11, 31))).toBe('winter');
  });

  it('rolls rain, snow, storm or fine weather by the chances of the season', () => {
    const rolls = (...values: number[]) => {
      let at = 0;
      return () => values[at++];
    };
    // roll 1..100: rain up to 30, snow up to 40, then fine
    expect(rollWeather(CHANCES, 'fall', rolls(0, 0.7))).toEqual({ kind: 'rain', intensity: 0.7 });
    expect(rollWeather(CHANCES, 'fall', rolls(0.35, 0))).toEqual({ kind: 'snow', intensity: 0.1 });
    expect(rollWeather(CHANCES, 'fall', rolls(0.5))).toBeUndefined();
    expect(rollWeather(CHANCES, 'summer', rolls(0.1, 0.5))).toEqual({ kind: 'storm', intensity: 0.5 });
    expect(rollWeather(CHANCES, 'winter', rolls(0.99, 1))).toEqual({ kind: 'snow', intensity: 1 });
    expect(rollWeather(CHANCES, 'spring')?.kind ?? 'fine').toMatch(/rain|fine/);
  });
});
