import { AREA_CAPITAL, AREA_SANCTUARY, GameZone } from '@keira/shared/wow-data';

export type Rgb = [number, number, number];

/** Level brackets by a zone's lowest level, as AoWoW colours them: [from level, colour]. */
export const LEVEL_BANDS: [number, Rgb][] = [
  [1, [47, 158, 68]],
  [10, [130, 201, 30]],
  [20, [252, 196, 25]],
  [30, [253, 126, 20]],
  [40, [224, 49, 49]],
  [50, [174, 62, 201]],
  [58, [59, 91, 219]],
  [68, [21, 170, 191]],
];
const CITY: Rgb = [241, 230, 200];
const ALLIANCE: Rgb = [60, 120, 230];
const HORDE: Rgb = [220, 50, 50];
const CONTESTED: Rgb = [240, 190, 40];
const SANCTUARY: Rgb = [250, 250, 250];

/** A zone's colour by its levels (cities their own); none without levels. */
export function levelColor(zone: GameZone | undefined): Rgb | undefined {
  if (!zone) {
    return undefined;
  }
  if (zone.flags & AREA_CAPITAL) {
    return CITY;
  }
  const min = zone.levels?.[0];
  return min === undefined ? undefined : [...LEVEL_BANDS].reverse().find(([from]) => min >= from)?.[1];
}

/** A zone's colour by whose land it is. */
export function territoryColor(zone: GameZone | undefined): Rgb | undefined {
  if (!zone) {
    return undefined;
  }
  return zone.flags & AREA_SANCTUARY
    ? SANCTUARY
    : zone.faction === 1
      ? ALLIANCE
      : zone.faction === 0
        ? HORDE
        : zone.faction === -1
          ? CONTESTED
          : undefined;
}

/** The CSS colour of a level band (for the legend). */
export const cssRgb = ([r, g, b]: Rgb): string => `rgb(${r}, ${g}, ${b})`;
