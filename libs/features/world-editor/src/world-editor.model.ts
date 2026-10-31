import { TableRow } from '@keira/shared/constants';

export type SpawnType = 'creature' | 'gameobject';

/** A creature or gameobject spawn as the world editor sees it. */
export interface SpawnRecord {
  type: SpawnType;
  guid: number;
  entry: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
  o: number;
  /** Waypoint path (creature_addon.path_id, or creature_template_addon.path_id when there is no addon row), 0 if none. */
  pathId: number;
  /** SmartAI paths its scripts start (`saiPathId`s), by entry or by guid. */
  saiPaths?: number[];
  /** Columns set for a spawn placed in this session (respawn time, wander distance…), added to its INSERT. */
  fields?: Record<string, number>;
  /** creature_template.speed_walk / speed_run (× 2.5 and × 7 yards per second). */
  speedWalk?: number;
  speedRun?: number;
  /** creature_template.detection_range: how far it notices a player of its own level (yards). */
  detectionRange?: number;
  /** creature_model_info of its model: the size the server gives it, and how far it reaches in melee (yards). */
  boundingRadius?: number;
  combatReach?: number;
  /** The path comes from creature_template_addon, so it is shared by every creature of this entry. */
  pathFromTemplate?: boolean;
  /** gameobject.rotation0..3 (x, y, z, w quaternion; all 0 = derived from orientation). */
  rotation?: Quaternion;
  /** Model shown in the 3D view (creature_template_model / gameobject_template.displayId), 0 = pin only. */
  displayId?: number;
  /** creature_template_model.DisplayScale or gameobject_template.size. */
  scale?: number;
  /** Creatures that wander (MovementType 1): how far from the spawn point (creature.wander_distance). */
  wanderDistance?: number;
  /** Creatures: the items in their hands (creature_equip_template ItemID1..3 of creature.equipment_id). */
  weapons?: number[];
  /** Game event the spawn belongs to (game_event_creature / game_event_gameobject with a positive eventEntry). */
  event?: number;
  /** Invisible trigger or "[DND]" helper (CREATURE_FLAG_EXTRA_TRIGGER, or "Trigger" / "Bunny" / "DND" in its name). */
  trigger?: boolean;
  /** creature.phaseMask / gameobject.phaseMask. */
  phaseMask?: number;
  /**
   * The difficulties it's spawned in (creature.spawnMask / gameobject.spawnMask): 1 normal (10), 2 heroic (25),
   * 4 10 heroic, 8 25 heroic; left out when 1.
   */
  spawnMask?: number;
  /** Faction template (creature_template.faction, gameobject_template_addon.faction), when set. */
  faction?: number;
  /** The template's AIName and ScriptName, when set. */
  aiName?: string;
  scriptName?: string;
  /** Loot tables it uses (creature lootid / pickpocketloot / skinloot, a chest's or fishing hole's Data1), when set. */
  loot?: { loot?: number; pickpocketing?: number; skinning?: number };
}

/** A spawn of a pool, for listing it and going there. */
export type PoolSpawn = Pick<SpawnRecord, 'type' | 'guid' | 'entry' | 'name' | 'map' | 'x' | 'y' | 'z'>;

/** Gameobject types that have loot in Data1: chests and fishing holes. */
export const GAMEOBJECT_CHEST = 3;
export const GAMEOBJECT_FISHING_HOLE = 25;
/** Ships, zeppelins and gunships moving between places (MO_TRANSPORT): Data6 is the map they carry. */
export const GAMEOBJECT_TRANSPORT = 15;
/** Gameobject type of portals (spellcasters: their spell teleports). */
export const GAMEOBJECT_SPELLCASTER = 22;

/**
 * Areas with a range around a place: capture points (gameobject type 29, Data0, and Eye of the Storm's towers), the
 * gameobjects that act on what comes near (traps, spell focuses, area damage, flag stands, fishing holes, aura
 * generators), where battleground players must wait before the gates open (battleground_template.StartMaxDist), and how
 * far SmartAI creatures see players (OOC / IC line of sight, players near).
 */
export type ZoneKind = 'capture' | 'trap' | 'focus' | 'damage' | 'flag' | 'fishing' | 'aura' | 'start' | 'sight';

export interface WorldZone {
  key: string;
  kind: ZoneKind;
  x: number;
  y: number;
  z: number;
  radius: number;
  /** What it is (the gameobject's or creature's name, the battleground's). */
  name: string;
  /** More about it (the entry, the script row, the side…). */
  detail: string;
}

/** Gameobject types with a range, the template field holding it, and whether it's a diameter (traps). */
export const RANGED_OBJECT_TYPES: Record<number, { kind: ZoneKind; field: 'Data0' | 'Data1' | 'Data2'; diameter?: boolean }> = {
  6: { kind: 'trap', field: 'Data2', diameter: true },
  8: { kind: 'focus', field: 'Data1' },
  12: { kind: 'damage', field: 'Data1' },
  24: { kind: 'flag', field: 'Data2' },
  25: { kind: 'fishing', field: 'Data0' },
  29: { kind: 'capture', field: 'Data0' },
  30: { kind: 'aura', field: 'Data1' },
};

/** SmartAI events with a range in their second parameter: out of combat / in combat line of sight, players near. */
export const SAI_SIGHT_EVENTS: Record<number, string> = { 10: 'OOC_LOS', 26: 'IC_LOS', 101: 'NEAR_PLAYERS' };

/** A gameobject template (the ones spawned by scripts, to draw and name them). */
export interface ObjectTemplate {
  entry: number;
  name: string;
  type: number;
  displayId: number;
  size: number;
  data: [number, number, number];
}

/** The range of a gameobject template (yards; 0: none). */
export function objectRange(template: Pick<ObjectTemplate, 'type' | 'data'>): number {
  const ranged = RANGED_OBJECT_TYPES[template.type];
  if (!ranged) {
    return 0;
  }
  const value = template.data[Number(ranged.field.slice(4))];
  return ranged.diameter ? value / 2 : value;
}

/** A quest a creature or gameobject entry starts or ends (creature_queststarter / _questender, gameobject_…). */
export interface SpawnQuest {
  type: SpawnType;
  entry: number;
  quest: number;
  role: 'starts' | 'ends';
  title: string;
}

export type Quaternion = [number, number, number, number];

export interface WaypointRecord {
  pathId: number;
  point: number;
  x: number;
  y: number;
  z: number;
  delay: number;
  /** waypoint_data.move_type: 0 walk, 1 run, 2 land, 3 take off. */
  moveType?: number;
  /** waypoint_scripts id run on arrival (0 = none), and its chance in %. */
  action?: number;
  actionChance?: number;
  /** The way the creature faces on arrival (radians); null/undefined: it keeps its own. */
  orientation?: number | null;
}

export interface Placement {
  x: number;
  y: number;
  z: number;
  o: number;
}

export type EditorTool = 'select' | 'face' | 'place-creature' | 'place-gameobject' | 'add-waypoint' | 'probe';

export interface LayerVisibility {
  creatures: boolean;
  gameobjects: boolean;
  waypoints: boolean;
  areaTriggers: boolean;
  /** Lines from formation members to their leader. */
  formations: boolean;
  /** Pools: their spawns linked to a label. */
  pools: boolean;
  /** Flight masters and flight paths. */
  flightPaths: boolean;
  /** Teleports and graveyards. */
  travel: boolean;
  /** Boss boundaries (from the AzerothCore source folder). */
  bossBoundaries: boolean;
  /** Capture points (outdoor PvP, Wintergrasp, Eye of the Storm) and where battleground players wait to start. */
  captureZones: boolean;
  /** The ranges of traps, spell focuses, area damage, flag stands, fishing holes and aura generators. */
  objectRanges: boolean;
  /** How far SmartAI creatures see players (line of sight events). */
  sightRanges: boolean;
  /** The gameobjects scripts spawn (battleground flags, banners and doors, Wintergrasp's walls and towers). */
  scriptObjects: boolean;
}

/** What a switch needs: the AzerothCore source folder, or the server's data folder (mmaps, vmaps, maps). */
export type Requirement = 'source' | 'serverData';

export type LayerSwitch = { key: keyof LayerVisibility; id: string; label: string; requires?: Requirement };

/** The layer switches of the toolbar, in order. */
export const LAYER_SWITCHES: LayerSwitch[] = [
  { key: 'creatures', id: 'creatures', label: 'WORLD_EDITOR.CREATURES' },
  { key: 'gameobjects', id: 'gameobjects', label: 'WORLD_EDITOR.GAMEOBJECTS' },
  { key: 'waypoints', id: 'waypoints', label: 'WORLD_EDITOR.WAYPOINTS' },
  { key: 'areaTriggers', id: 'area-triggers', label: 'WORLD_EDITOR.AREA_TRIGGERS' },
];

/** The overlay switches of the View panel, in order. */
export const OVERLAY_SWITCHES: LayerSwitch[] = [
  { key: 'formations', id: 'formations', label: 'WORLD_EDITOR.FORMATIONS' },
  { key: 'pools', id: 'pools', label: 'WORLD_EDITOR.POOLS' },
  { key: 'flightPaths', id: 'flight-paths', label: 'WORLD_EDITOR.FLIGHT_PATHS' },
  { key: 'travel', id: 'travel', label: 'WORLD_EDITOR.TRAVEL' },
  { key: 'bossBoundaries', id: 'boss-boundaries', label: 'WORLD_EDITOR.BOSS_BOUNDARIES', requires: 'source' },
  { key: 'captureZones', id: 'capture-zones', label: 'WORLD_EDITOR.CAPTURE_ZONES' },
  { key: 'scriptObjects', id: 'script-objects', label: 'WORLD_EDITOR.SCRIPT_OBJECTS', requires: 'source' },
  { key: 'objectRanges', id: 'object-ranges', label: 'WORLD_EDITOR.OBJECT_RANGES' },
  { key: 'sightRanges', id: 'sight-ranges', label: 'WORLD_EDITOR.SIGHT_RANGES' },
];

/** Rows as returned by the spawn and waypoint queries. */
export interface SpawnRow extends TableRow {
  guid: number;
  entry: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
  o: number;
  pathId: number;
  pathFromTemplate: number;
  rotation0: number;
  rotation1: number;
  rotation2: number;
  rotation3: number;
  displayId: number;
  scale: number;
  wanderDistance: number;
  movementType: number;
  eventEntry: number;
  isTrigger: number;
  phaseMask: number;
  speedWalk: number;
  speedRun: number;
}

export interface WaypointRow extends TableRow {
  pathId: number;
  point: number;
  x: number;
  y: number;
  z: number;
  delay: number;
  moveType: number;
  action: number;
  actionChance: number;
}

export interface TeleRow extends TableRow {
  id: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
}

export const spawnKey = (type: SpawnType, guid: number): string => `${type}:${guid}`;
export const pathKey = (pathId: number): string => `path:${pathId}`;

/**
 * SmartAI paths (the `waypoints` table, started by SmartAI actions) share the path id space with negative ids, so a
 * SmartAI path `entry` is `-entry` here and can't clash with a `waypoint_data` path of the same number.
 */
export const saiPathId = (entry: number): number => -entry;
export const isSaiPath = (pathId: number): boolean => pathId < 0;
export const saiPathEntry = (pathId: number): number => -pathId;
/** A creature or gameobject template found by the place tools' search. */
export interface PlaceTemplate {
  entry: number;
  name: string;
  /** Its model (0: none) and size. */
  displayId: number;
  scale: number;
}

/** A path shown only with View > Every path in the area (drawn, not edited). */
export interface AreaPath {
  /** `waypoint_data`, SmartAI `waypoints`, or an escort script's `script_waypoint`. */
  source: 'data' | 'sai' | 'script';
  /** Path id, or the creature entry for SmartAI and script paths. */
  id: number;
  points: { point: number; x: number; y: number; z: number; delay: number }[];
}

/** "Path 12" or "SmartAI path 12". */
export const pathLabel = (pathId: number): string => (isSaiPath(pathId) ? `SmartAI path ${saiPathEntry(pathId)}` : `Path ${pathId}`);

export function parseSpawnKey(key: string): { type: SpawnType; guid: number } | undefined {
  const match = /^(creature|gameobject):(\d+)$/.exec(key);
  return match ? { type: match[1] as SpawnType, guid: Number(match[2]) } : undefined;
}

/** Preferred id for a new path: AzerothCore's data conventionally uses `guid * 10`. */
export const preferredPathId = (guid: number): number => guid * 10;

/** Half-size of the square (in yards) around the camera whose spawns are loaded. */
export const SPAWN_LOAD_RADIUS = 450;
/** How long (ms) typing in the teleport box pauses before teleports are looked up. */
export const TELE_SEARCH_DELAY = 300;

/** How far (yards) the camera goes from where the spawns were last loaded before they're loaded again. */
export const SPAWN_RELOAD_DISTANCE = 150;
export const SPAWN_LOAD_LIMIT = 3000;

/** A `creature_formations` row: `member` follows `leader` at `dist` yards and `angle` degrees from its facing. */
export interface FormationMember {
  leader: number;
  member: number;
  dist: number;
  angle: number;
  groupAI: number;
}

/** A spawn of a pool: up to `maxLimit` of the pool's spawns are up at once (0: all of them). */
export interface PoolMember {
  type: SpawnType;
  guid: number;
  pool: number;
  chance: number;
  maxLimit: number;
  description: string;
}

/** A graveyard (`game_graveyard`). */
export interface Graveyard {
  id: number;
  x: number;
  y: number;
  z: number;
  comment: string;
  /** Who resurrects there (graveyard_zone.Faction: 0 both, 469 Alliance, 67 Horde); undefined when not linked. */
  sides?: { alliance: boolean; horde: boolean };
}

/** Where an area trigger teleports to (`areatrigger_teleport`). */
export interface Teleport {
  id: number;
  name: string;
  map: number;
  x: number;
  y: number;
  z: number;
}

/** A spawn column the properties panel edits: a number, or a choice among options. */
export interface SpawnField {
  column: string;
  label: string;
  /** Its value for a new spawn (what the editor inserts). */
  default: number;
  options?: { value: number; label: string }[];
  step?: number;
}

/** The spawn columns the properties panel edits, by spawn type. */
export const SPAWN_FIELDS: Record<SpawnType, SpawnField[]> = {
  creature: [
    { column: 'spawntimesecs', label: 'WORLD_EDITOR.FIELD_RESPAWN', default: 300 },
    {
      column: 'MovementType',
      label: 'WORLD_EDITOR.FIELD_MOVEMENT',
      default: 0,
      options: [
        { value: 0, label: 'WORLD_EDITOR.MOVEMENT_IDLE' },
        { value: 1, label: 'WORLD_EDITOR.MOVEMENT_RANDOM' },
        { value: 2, label: 'WORLD_EDITOR.MOVEMENT_WAYPOINT' },
      ],
    },
    { column: 'wander_distance', label: 'WORLD_EDITOR.FIELD_WANDER', default: 0, step: 0.5 },
    { column: 'phaseMask', label: 'WORLD_EDITOR.FIELD_PHASE_MASK', default: 1 },
    { column: 'spawnMask', label: 'WORLD_EDITOR.FIELD_SPAWN_MASK', default: 1 },
    { column: 'equipment_id', label: 'WORLD_EDITOR.FIELD_EQUIPMENT', default: 0 },
  ],
  gameobject: [
    { column: 'spawntimesecs', label: 'WORLD_EDITOR.FIELD_RESPAWN', default: 300 },
    { column: 'phaseMask', label: 'WORLD_EDITOR.FIELD_PHASE_MASK', default: 1 },
    { column: 'spawnMask', label: 'WORLD_EDITOR.FIELD_SPAWN_MASK', default: 1 },
    {
      column: 'state',
      label: 'WORLD_EDITOR.FIELD_STATE',
      default: 1,
      options: [
        { value: 0, label: 'WORLD_EDITOR.STATE_ACTIVE' },
        { value: 1, label: 'WORLD_EDITOR.STATE_READY' },
      ],
    },
    { column: 'animprogress', label: 'WORLD_EDITOR.FIELD_ANIM', default: 0 },
  ],
};
