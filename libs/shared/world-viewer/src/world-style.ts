import { Service, signal } from '@angular/core';

/** The shapes a spawn pin or a waypoint can have. */
export type MarkerShape = 'cylinder' | 'box' | 'sphere' | 'cone' | 'diamond';
export const MARKER_SHAPES: MarkerShape[] = ['cylinder', 'box', 'sphere', 'cone', 'diamond'];

/** A colour (#rrggbb) and how solid it is (0..1). */
export interface StyleColor {
  color: string;
  opacity: number;
}

/** The colours and shapes the view draws its markers, lines and circles with (View > Colours and shapes). */
export interface WorldStyle {
  creature: StyleColor;
  creatureShape: MarkerShape;
  gameobject: StyleColor;
  gameobjectShape: MarkerShape;
  selected: StyleColor;
  /** Waypoints on the ground (in the air, in water and under the map keep their own shapes, which tell where they are). */
  waypointShape: MarkerShape;
  /** How big waypoints are drawn (1: as built). */
  waypointSize: number;
  /** The colours paths are given (each path keeps one, picked by its id), and how solid their lines are. */
  pathColors: string[];
  pathOpacity: number;
  areaTrigger: StyleColor;
  wander: StyleColor;
  bounds: StyleColor;
  reach: StyleColor;
  aggro: StyleColor;
  assist: StyleColor;
  formation: StyleColor;
  pathStart: StyleColor;
  simulationDone: StyleColor;
  simulationDetour: StyleColor;
  simulationStuck: StyleColor;
  simulationCurrent: StyleColor;
  simulationNext: StyleColor;
  probePath: StyleColor;
  probeClear: StyleColor;
  probeBlocked: StyleColor;
  tag: StyleColor;
}

const c = (color: string, opacity = 1): StyleColor => ({ color, opacity });

export const DEFAULT_WORLD_STYLE: WorldStyle = {
  creature: c('#ff9f1c'),
  creatureShape: 'cylinder',
  gameobject: c('#2ec4f1'),
  gameobjectShape: 'box',
  selected: c('#fff35c'),
  waypointShape: 'cone',
  waypointSize: 1,
  pathColors: ['#e63946', '#b5179e', '#7209b7', '#06d6a0', '#4361ee', '#ff006e', '#8ac926', '#ffffff'],
  pathOpacity: 0.85,
  areaTrigger: c('#c77dff', 0.15),
  wander: c('#ffd166', 0.8),
  bounds: c('#4ade80', 0.9),
  reach: c('#f87171', 0.9),
  aggro: c('#ff8c00', 0.85),
  assist: c('#60a5fa', 0.85),
  formation: c('#9b5de5'),
  pathStart: c('#9be15d'),
  simulationDone: c('#22c55e'),
  simulationDetour: c('#facc15'),
  simulationStuck: c('#ef4444'),
  simulationCurrent: c('#3b82f6'),
  simulationNext: c('#9ca3af'),
  probePath: c('#22d3ee'),
  probeClear: c('#4ade80'),
  probeBlocked: c('#ef4444'),
  tag: c('#7c3aed'),
};

export const WORLD_STYLE_KEY = 'keira3.worldEditor.style';

/** A colour as Three.js takes it (0xrrggbb). */
export function colorNumber(color: string): number {
  return parseInt(color.slice(1), 16);
}

/** A colour with its opacity as CSS takes it (rgba). */
export function cssColor({ color, opacity }: StyleColor): string {
  const n = colorNumber(color);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
}

const HEX = /^#[0-9a-f]{6}$/i;
const isColor = (value: unknown): value is StyleColor =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as StyleColor).color === 'string' &&
  HEX.test((value as StyleColor).color) &&
  typeof (value as StyleColor).opacity === 'number' &&
  (value as StyleColor).opacity >= 0 &&
  (value as StyleColor).opacity <= 1;

/** Whether a stored value fits where the default `fallback` is (the same kind of colour, shape, list or number). */
function fits(value: unknown, fallback: unknown): boolean {
  if (Array.isArray(fallback)) {
    return Array.isArray(value) && value.length === fallback.length && value.every((item) => typeof item === 'string' && HEX.test(item));
  }
  if (typeof fallback === 'string') {
    return MARKER_SHAPES.includes(value as MarkerShape);
  }
  if (typeof fallback === 'number') {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
  }
  return isColor(value);
}

/** The user's colours and shapes (each one kept until reset to its default), remembered between sessions. */
@Service()
export class WorldStyleService {
  private readonly _style = signal<WorldStyle>(this.load());
  readonly style = this._style.asReadonly();

  update(changes: Partial<WorldStyle>): void {
    const next = { ...this._style(), ...changes };
    this._style.set(next);
    try {
      localStorage.setItem(WORLD_STYLE_KEY, JSON.stringify(next));
    } catch {
      // (not kept)
    }
  }

  /** Puts one back to its default, or every one. */
  reset(key?: keyof WorldStyle): void {
    this.update(key ? { [key]: DEFAULT_WORLD_STYLE[key] } : DEFAULT_WORLD_STYLE);
  }

  private load(): WorldStyle {
    try {
      const stored = JSON.parse(localStorage.getItem(WORLD_STYLE_KEY) ?? '{}') as Record<string, unknown>;
      const result: Record<string, unknown> = { ...DEFAULT_WORLD_STYLE };
      for (const [key, fallback] of Object.entries(DEFAULT_WORLD_STYLE)) {
        if (fits(stored[key], fallback)) {
          result[key] = stored[key];
        }
      }
      return result as unknown as WorldStyle;
    } catch {
      return { ...DEFAULT_WORLD_STYLE };
    }
  }
}
