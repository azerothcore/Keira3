import { AREA_CAPITAL, AREA_SANCTUARY, GameZone, RgbaImage, SHAPE_HEIGHT, SHAPE_WIDTH } from '@keira/shared/wow-data';

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
const EDGE: Rgb = [255, 236, 170];
const SUB_EDGE: Rgb = [255, 255, 255];
const HOVER: Rgb = [255, 214, 64];

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

export interface ShapePaint {
  /** The zones' shapes (labels on the grid), filled with each one's colour… */
  labels?: ArrayLike<number>;
  fill?: (label: number) => Rgb | undefined;
  /** …and their edges, and the edges of sub-zones. */
  edges?: Uint8Array;
  subEdges?: Uint8Array;
}

/** How solid the layers are drawn (of 255). */
const FILL_ALPHA = 80;
const EDGE_ALPHA = 220;
const SUB_EDGE_ALPHA = 110;

/** The layers over a page (colours, borders) as a picture on the shape grid; undefined when there's nothing to draw. */
export function paintShapes({ labels, fill, edges, subEdges }: ShapePaint): RgbaImage | undefined {
  if (!(labels && fill) && !edges && !subEdges) {
    return undefined;
  }
  const data = new Uint8Array(SHAPE_WIDTH * SHAPE_HEIGHT * 4);
  const colors = new Map<number, Rgb | undefined>();
  for (let i = 0; i < SHAPE_WIDTH * SHAPE_HEIGHT; i++) {
    if (edges?.[i]) {
      data.set([...EDGE, EDGE_ALPHA], i * 4);
    } else if (subEdges?.[i]) {
      data.set([...SUB_EDGE, SUB_EDGE_ALPHA], i * 4);
    } else if (labels && fill && labels[i]) {
      const label = labels[i];
      if (!colors.has(label)) {
        colors.set(label, fill(label));
      }
      const color = colors.get(label);
      if (color) {
        data.set([...color, FILL_ALPHA], i * 4);
      }
    }
  }
  return { width: SHAPE_WIDTH, height: SHAPE_HEIGHT, data };
}

/** One shape lit up (the zone under the pointer), with a bright edge. */
export function paintHover(labels: ArrayLike<number>, edges: Uint8Array, label: number): RgbaImage {
  const data = new Uint8Array(SHAPE_WIDTH * SHAPE_HEIGHT * 4);
  for (let i = 0; i < SHAPE_WIDTH * SHAPE_HEIGHT; i++) {
    if (labels[i] === label) {
      data.set([...HOVER, edges[i] ? 255 : 70], i * 4);
    }
  }
  return { width: SHAPE_WIDTH, height: SHAPE_HEIGHT, data };
}
