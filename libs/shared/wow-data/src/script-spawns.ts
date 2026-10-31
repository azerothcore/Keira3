/**
 * Gameobjects the AzerothCore scripts spawn themselves (they're not in the `gameobject` table): battleground flags,
 * banners, doors and capture points (`AddObject(…)`), Wintergrasp's walls, towers and workshops
 * (`WGGameObjectBuilding`), the outdoor PvP towers (`HPCapturePoints`…). Read from the source folder: a gameobject
 * entry followed by a position, in a call or a list (`{ 190219, 3749, 5371.46f, 3047.47f, 407.571f, 3.14159f, … }`).
 */

/** A gameobject spawned by a script: its entry, map, position and where it was read; `radius` for capture points. */
export interface ScriptSpawn {
  entry: number;
  mapId: number;
  x: number;
  y: number;
  z: number;
  o: number;
  /** The file it's spawned in (its name). */
  file: string;
  /** How close players capture it (yards), when the script says (Eye of the Storm's towers). */
  radius?: number;
}

/** The maps of the scripts' files, by their start: the battlegrounds, Wintergrasp and the outdoor PvP zones. */
const FILE_MAPS: [RegExp, number][] = [
  [/^BattlegroundAB\b/, 529],
  [/^BattlegroundAV\b/, 30],
  [/^BattlegroundEY\b/, 566],
  [/^BattlegroundWS\b/, 489],
  [/^BattlegroundSA\b/, 607],
  [/^BattlegroundIC\b/, 628],
  [/^BattlegroundNA\b/, 559],
  [/^BattlegroundBE\b/, 562],
  [/^BattlegroundRL\b/, 572],
  [/^BattlegroundDS\b/, 617],
  [/^BattlegroundRV\b/, 618],
  [/^BattlefieldWG\b/, 571],
  [/^OutdoorPvP(HP|ZM|TF|NA)\b/, 530],
  [/^OutdoorPvPEP\b/, 0],
  [/^OutdoorPvPSI\b/, 1],
  [/^OutdoorPvPGH\b/, 571],
];

/** The map a script file spawns on (by its name: `BattlegroundEY.cpp`); undefined for others. */
export function scriptFileMap(file: string): number | undefined {
  return FILE_MAPS.find(([name]) => name.test(file))?.[1];
}

/** Gameobject entries are at least this (indexes, world states and maps are below). */
const MIN_ENTRY = 10000;
const NUMBER = String.raw`-?\d+(?:\.\d+)?f?`;
const TOKEN = String.raw`[A-Za-z_]\w*|\d+`;
/** `entry, [map or other], [{] x, y, z[, o]`. */
const SPAWN = new RegExp(
  String.raw`(?<![\w.])(${TOKEN})\s*,\s*(?:(${TOKEN})\s*,\s*)?\{?\s*(${NUMBER})\s*,\s*(${NUMBER})\s*,\s*(${NUMBER})(?:\s*,\s*(${NUMBER}))?`,
  'g',
);

/** `NAME = 123` (enums, constants) and `#define NAME 123`, by name. */
export function parseScriptConstants(text: string): Map<string, number> {
  const constants = new Map<string, number>();
  for (const m of text.matchAll(/\b([A-Za-z_]\w*)\s*=\s*(\d+)\b(?!\.)/g)) {
    constants.set(m[1], Number(m[2]));
  }
  for (const m of text.matchAll(/#define\s+([A-Za-z_]\w*)\s+(\d+)\b(?!\.)/g)) {
    constants.set(m[1], Number(m[2]));
  }
  return constants;
}

/**
 * The gameobjects a script file spawns, with `constants` naming its entries and maps (every file of its folder, and
 * AreaDefines.h): entries followed by a position, lists of entries beside lists of positions (`BG_SA_ObjEntries` and
 * `BG_SA_ObjSpawnlocs`), and Arathi Basin's banners (`BG_AB_NodePositions` from `…_NODE_BANNER_0` on). Candidates:
 * what isn't a gameobject entry is left for the database to tell.
 */
export function parseScriptSpawns(text: string, file: string, constants: Map<string, number>): ScriptSpawn[] {
  const code = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
  const fileMap = scriptFileMap(file);
  const value = (token: string | undefined) =>
    token === undefined ? undefined : /^\d+$/.test(token) ? Number(token) : constants.get(token);
  // (`BG_EY_POINT_RADIUS = 50`: how close players capture Eye of the Storm's towers)
  const radius = [...constants].find(([name]) => /_POINT_RADIUS$/.test(name) && /^Battleground/.test(file))?.[1];
  const spawns: ScriptSpawn[] = [];
  const add = (entry: number, mapId: number | undefined, numbers: string[], name = '') => {
    const [x, y, z, o = 0] = numbers.map((n) => parseFloat(n));
    if (mapId === undefined) {
      return;
    }
    if (!spawns.some((s) => s.entry === entry && s.x === x && s.y === y && s.z === z)) {
      spawns.push({ entry, mapId, x, y, z, o, file, ...(radius && /CAP/.test(name) ? { radius } : {}) });
    }
  };

  for (const m of code.matchAll(SPAWN)) {
    const [, first, second, ...numbers] = m;
    const coords = numbers.slice(0, 3);
    // (positions have decimals; indexes and counts don't)
    if (coords.filter((n) => n.includes('.')).length < 2) {
      continue;
    }
    const [a, b] = [value(first), value(second)];
    const isMap = (token: string | undefined) => !!token && /^MAP_/.test(token);
    // `{ index, entry, x… }` (Isle of Conquest), else `{ entry, map or world state, x… }`
    const [entry, name, other] = b !== undefined && b >= MIN_ENTRY && !isMap(second) ? [b, second, first] : [a, first, second];
    if (entry === undefined || entry < MIN_ENTRY) {
      continue;
    }
    add(entry, (isMap(other) ? value(other) : undefined) ?? fileMap, numbers.filter(Boolean) as string[], name);
  }

  // lists of entries beside lists of positions: `X_ObjEntries[…] = { … }` and `X_ObjSpawnlocs[…][4] = { {…}, … }`
  for (const list of code.matchAll(/\b(\w+?)(?:Obj)?Entries\s*\[[^\]]*\]\s*=\s*\{([^}]*)\}/g)) {
    const entries = list[2].split(',').map((token) => value(token.trim()));
    const positions = positionList(
      code,
      new RegExp(String.raw`\b${list[1]}(?:Obj)?(?:Spawnlocs|SpawnLocs|Positions)\s*\[[^\]]*\]\s*\[\s*4\s*\]\s*=\s*\{`),
    );
    positions.forEach((numbers, i) => {
      const entry = entries[i];
      if (entry !== undefined && entry >= MIN_ENTRY) {
        add(entry, fileMap, numbers);
      }
    });
  }

  // Arathi Basin: a banner on each node, the entries one after the other
  const banner = [...constants].find(([name]) => /_NODE_BANNER_0$/.test(name) && code.includes(name));
  if (banner) {
    positionList(code, /\b\w*NodePositions\s*\[[^\]]*\]\s*\[\s*4\s*\]\s*=\s*\{/).forEach((numbers, i) =>
      add(banner[1] + i, fileMap, numbers),
    );
  }
  return spawns;
}

/** The rows of a `float const X[…][4] = { { x, y, z, o }, … }` list found by `start`. */
function positionList(code: string, start: RegExp): string[][] {
  const at = code.search(start);
  if (at < 0) {
    return [];
  }
  const open = code.indexOf('{', at);
  const close = code.indexOf('};', open);
  const body = code.slice(open + 1, close);
  return [...body.matchAll(/\{([^}]*)\}/g)]
    .map((row) => row[1].split(',').map((n) => n.trim()))
    .filter((row) => row.length >= 3 && row.slice(0, 3).every((n) => new RegExp(`^${NUMBER}$`).test(n)));
}
