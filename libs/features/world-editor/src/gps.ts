/** A place as printed by the server's `.gps` command. */
export interface GpsLocation {
  map: number;
  x: number;
  y: number;
  z: number;
  o: number;
}

const NUMBER = '(-?\\d+(?:\\.\\d+)?)';

/**
 * Reads the output of `.gps` (or any text with "Map: … X: … Y: … Z: … Orientation: …", e.g. copied from the chat
 * log with timestamps). Undefined unless all five values are there.
 */
export function parseGpsOutput(text: string): GpsLocation | undefined {
  const value = (label: string): number | undefined => {
    const match = new RegExp(`(?:^|[^A-Za-z])${label}:\\s*${NUMBER}`, 'i').exec(text);
    return match ? Number(match[1]) : undefined;
  };
  const [map, x, y, z, o] = ['Map', 'X', 'Y', 'Z', 'Orientation'].map(value);
  if ([map, x, y, z, o].some((v) => v === undefined)) {
    return undefined;
  }
  return { map: map as number, x: x as number, y: y as number, z: z as number, o: o as number };
}
