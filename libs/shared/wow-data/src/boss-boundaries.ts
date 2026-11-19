/**
 * Boss boundaries of AzerothCore: the areas bosses fight in (leaving one makes them evade), written in the instance
 * scripts as `BossBoundaryData const boundaries = { { DATA_BOSS, new CircleBoundary(…) }, … };` (see AreaBoundary.h).
 * A creature is within its boundary when it's within every shape listed for its boss.
 */

export interface BoundaryPoint {
  x: number;
  y: number;
}

/** One shape of `AreaBoundary.h`; `inverted` shapes keep the boss out instead of in. */
export type BoundaryShape =
  | { type: 'circle'; center: BoundaryPoint; radius: number; inverted: boolean }
  /** `radiusX` along the server x axis (north), `radiusY` along y (west). */
  | { type: 'ellipse'; center: BoundaryPoint; radiusX: number; radiusY: number; inverted: boolean }
  | { type: 'rectangle'; minX: number; maxX: number; minY: number; maxY: number; inverted: boolean }
  | { type: 'triangle'; points: [BoundaryPoint, BoundaryPoint, BoundaryPoint]; inverted: boolean }
  /** Corners A, B, C, D (C = B + D − A). */
  | { type: 'parallelogram'; points: [BoundaryPoint, BoundaryPoint, BoundaryPoint, BoundaryPoint]; inverted: boolean }
  | { type: 'zrange'; minZ: number; maxZ: number; inverted: boolean }
  | { type: 'union' | 'intersect'; shapes: [BoundaryShape, BoundaryShape]; inverted: boolean };

/** The boundary of one boss of an instance: its shapes, and the scripts (`ScriptName`) of the creatures it applies to. */
export interface BossBoundary {
  mapId: number;
  /** The instance script, e.g. `instance_naxxramas`. */
  instance: string;
  /** The boss's data id in the scripts, e.g. `BOSS_PATCHWERK`. */
  boss: string;
  shapes: BoundaryShape[];
  scriptNames: string[];
}

/** A parsed value of a boundary expression. */
type Value = number | boolean | BoundaryPoint | BoundaryShape;

/** `MAP_NAXXRAMAS = 533,` lines (game/Maps/AreaDefines.h), by name. */
export function parseMapConstants(text: string): Map<string, number> {
  return new Map([...text.matchAll(/\b(MAP_\w+)\s*=\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
}

/**
 * The instance script of a file (`InstanceMapScript("instance_x", MAP_X or 533)`) and its `BossBoundaryData` entries;
 * undefined when the file has none. Shapes it can't read are left out.
 */
export function parseInstanceBoundaries(
  text: string,
): { instance: string; map: string; entries: { boss: string; shape: BoundaryShape }[] } | undefined {
  const code = stripComments(text);
  // `InstanceMapScript("instance_x", MAP_X)` (the name may be a constant), or `RegisterInstanceScript(instance_x, MAP_X)`
  const script = /(?:InstanceMapScript|RegisterInstanceScript)\s*\(\s*"?(\w+)"?\s*,\s*(\w+)\s*\)/.exec(code);
  const data = code.search(/BossBoundaryData\s+const\s+\w+\s*=\s*\{/);
  if (!script || data < 0) {
    return undefined;
  }
  const body = balanced(code, code.indexOf('{', data));
  const entries: { boss: string; shape: BoundaryShape }[] = [];
  for (const entry of body.matchAll(/\{\s*(\w+)\s*,\s*(?=new\b)/g)) {
    const shape = parseExpression(body, (entry.index as number) + entry[0].length)?.value;
    if (shape && typeof shape === 'object' && 'type' in shape) {
      entries.push({ boss: entry[1], shape });
    }
  }
  return { instance: script[1], map: script[2], entries };
}

/**
 * Which creature scripts use each boss's boundary: AIs built as `BossAI(creature, DATA_X)`, and those calling
 * `SetBoundary(instance->GetBossBoundary(DATA_X))`. The script name is the AI's class name without its `AI` ending.
 */
export function parseBossScripts(text: string): Map<string, string[]> {
  const scripts = new Map<string, string[]>();
  const add = (boss: string, name: string) => {
    const script = name.replace(/AI$/, '');
    const list = scripts.get(boss) ?? [];
    if (!list.includes(script)) {
      scripts.set(boss, [...list, script]);
    }
  };
  const code = stripComments(text);
  for (const m of code.matchAll(/(\w+)\s*\(\s*Creature\s*\*\s*\w+\s*\)\s*:\s*BossAI\s*\(\s*\w+\s*,\s*(\w+)\s*\)/g)) {
    add(m[2], m[1]);
  }
  for (const m of code.matchAll(/SetBoundary\s*\(\s*\w+\s*->\s*GetBossBoundary\s*\(\s*(\w+)\s*\)\s*\)/g)) {
    const constructors = [...code.slice(0, m.index).matchAll(/(\w+)\s*\(\s*Creature\s*\*\s*\w+\s*\)/g)];
    const owner = constructors[constructors.length - 1];
    if (owner) {
      add(m[1], owner[1]);
    }
  }
  return scripts;
}

/** The outline of a flat shape, as points (circles and ellipses with `segments` points); undefined for the others. */
export function boundaryOutline(shape: BoundaryShape, segments = 64): BoundaryPoint[] | undefined {
  switch (shape.type) {
    case 'circle':
    case 'ellipse': {
      const [rx, ry] = shape.type === 'circle' ? [shape.radius, shape.radius] : [shape.radiusX, shape.radiusY];
      return Array.from({ length: segments }, (_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        return { x: shape.center.x + Math.cos(angle) * rx, y: shape.center.y + Math.sin(angle) * ry };
      });
    }
    case 'rectangle':
      return [
        { x: shape.minX, y: shape.minY },
        { x: shape.maxX, y: shape.minY },
        { x: shape.maxX, y: shape.maxY },
        { x: shape.minX, y: shape.maxY },
      ];
    case 'triangle':
    case 'parallelogram':
      return shape.points;
    default:
      return undefined;
  }
}

/** A short description of a shape, e.g. "circle r 50 at (-11126.3, -1929.1)". */
export function describeBoundary(shape: BoundaryShape): string {
  const at = (p: BoundaryPoint) => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`;
  const out = shape.inverted ? ' (keeps out)' : '';
  switch (shape.type) {
    case 'circle':
      return `circle r ${shape.radius.toFixed(1)} at ${at(shape.center)}${out}`;
    case 'ellipse':
      return `ellipse ${shape.radiusX.toFixed(1)} × ${shape.radiusY.toFixed(1)} at ${at(shape.center)}${out}`;
    case 'rectangle':
      return `rectangle x ${shape.minX}..${shape.maxX}, y ${shape.minY}..${shape.maxY}${out}`;
    case 'triangle':
      return `triangle ${shape.points.map(at).join(' ')}${out}`;
    case 'parallelogram':
      return `parallelogram ${shape.points.map(at).join(' ')}${out}`;
    case 'zrange':
      return `height ${shape.minZ}..${shape.maxZ}${out}`;
    default:
      return `${shape.type} of ${shape.shapes.map(describeBoundary).join(' and ')}${out}`;
  }
}

// ---------------------------------------------------------------- the expression reader

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
}

/** The text between the `{` at `open` and its matching `}`. */
function balanced(text: string, open: number): string {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    depth += text[i] === '{' ? 1 : text[i] === '}' ? -1 : 0;
    if (depth === 0) {
      return text.slice(open + 1, i);
    }
  }
  return text.slice(open + 1);
}

/** Reads `new Shape(args)`, `Position(x, y[, z[, o]])`, a number or a boolean starting at `at`. */
function parseExpression(text: string, at: number): { value: Value; end: number } | undefined {
  const rest = text.slice(at);
  const number = /^\s*(-?\d+(?:\.\d*)?(?:[eE][-+]?\d+)?|-?\.\d+)[fF]?/.exec(rest);
  if (number) {
    return { value: Number(number[1]), end: at + number[0].length };
  }
  const bool = /^\s*(true|false)\b/.exec(rest);
  if (bool) {
    return { value: bool[1] === 'true', end: at + bool[0].length };
  }
  const call = /^\s*(?:new\s+)?(\w+)\s*\(/.exec(rest);
  if (!call) {
    return undefined;
  }
  const args: Value[] = [];
  let i = at + call[0].length;
  while (!/^\s*\)/.test(text.slice(i))) {
    const arg = parseExpression(text, i);
    if (!arg) {
      return undefined;
    }
    args.push(arg.value);
    i = arg.end;
    const comma = /^\s*,/.exec(text.slice(i));
    if (comma) {
      i += comma[0].length;
    }
  }
  const end = i + (/^\s*\)/.exec(text.slice(i)) as RegExpExecArray)[0].length;
  const value = build(call[1], args);
  return value === undefined || !complete(value) ? undefined : { value, end };
}

/** No argument missing: every number of the value (and of what it's made of) is there. */
function complete(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  return typeof value === 'boolean' || typeof value === 'string' || (!!value && Object.values(value as object).every(complete));
}

function build(name: string, args: Value[]): Value | undefined {
  const num = (i: number) => args[i] as number;
  const point = (i: number) => args[i] as BoundaryPoint;
  const inverted = (i: number) => args[i] === true;
  const isPoint = (v: Value | undefined): v is BoundaryPoint => typeof v === 'object' && !('type' in v);
  switch (name) {
    case 'Position':
      return { x: num(0), y: num(1) };
    case 'RectangleBoundary':
      return { type: 'rectangle', minX: num(0), maxX: num(1), minY: num(2), maxY: num(3), inverted: inverted(4) };
    case 'CircleBoundary': {
      const center = point(0);
      if (isPoint(args[1])) {
        const edge = args[1];
        return { type: 'circle', center, radius: Math.hypot(edge.x - center.x, edge.y - center.y), inverted: inverted(2) };
      }
      return { type: 'circle', center, radius: num(1), inverted: inverted(2) };
    }
    case 'EllipseBoundary':
      return { type: 'ellipse', center: point(0), radiusX: num(1), radiusY: num(2), inverted: inverted(3) };
    case 'TriangleBoundary':
      return { type: 'triangle', points: [point(0), point(1), point(2)], inverted: inverted(3) };
    case 'ParallelogramBoundary': {
      const [a, b, d] = [point(0), point(1), point(2)];
      return { type: 'parallelogram', points: [a, b, { x: d.x + b.x - a.x, y: d.y + b.y - a.y }, d], inverted: inverted(3) };
    }
    case 'ZRangeBoundary':
      return { type: 'zrange', minZ: num(0), maxZ: num(1), inverted: inverted(2) };
    case 'BoundaryUnionBoundary':
    case 'BoundaryIntersectBoundary':
      return {
        type: name === 'BoundaryUnionBoundary' ? 'union' : 'intersect',
        shapes: [args[0] as BoundaryShape, args[1] as BoundaryShape],
        inverted: inverted(2),
      };
    default:
      return undefined;
  }
}
