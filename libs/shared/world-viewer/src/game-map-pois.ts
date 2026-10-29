import { FactionTemplate } from '@keira/shared/wow-data';

/**
 * What the game map can show, in groups like AoWoW's map menu: the map's own layers (level colours, borders, names…),
 * then points of interest (townsfolk, professions, vendors, travel, locations), each with an icon from the client.
 */

/** A point of interest: a creature or object that serves players (a flight master, a mailbox…), or a place. */
export interface GameMapPoi {
  /** One of the layer keys below (`flight`, `prof:171`…). */
  kind: string;
  mapId: number;
  x: number;
  y: number;
  z: number;
  name: string;
  subname?: string;
  /** Its faction template, to tell whose side it serves. */
  faction?: number;
  /** The zone it is in (AreaTable id; 0 when the server hasn't worked it out). */
  zoneId?: number;
}

/** A transport's route (a boat, a zeppelin…): its taxi path and faction. */
export interface GameMapTransport {
  entry: number;
  name: string;
  path: number;
  faction: number;
}

/** An area trigger teleporting to another map (an instance's entrance). */
export interface GameMapTeleport {
  id: number;
  name: string;
  targetMap: number;
}

/** How a layer's markers look: a picture of the client (a whole file, or a cell of the world map's icon atlas), drawn round or as a framed square icon; or a Font Awesome icon in a colour. */
export interface GameMapIcon {
  path?: string;
  /** A cell of `POI_ATLAS`. */
  atlas?: number;
  /** A part of the picture: [x, y, width, height]. */
  crop?: [number, number, number, number];
  /** A square ability-like icon, drawn in a frame. */
  square?: boolean;
  fa?: string;
  color?: string;
}

export interface GameMapLayer {
  key: string;
  /** i18n key of its name. */
  label: string;
  icon?: GameMapIcon;
  /** Shown before the user chooses. */
  shown: boolean;
}

export interface GameMapLayerGroup {
  key: string;
  label: string;
  /** Sub-headings: the layers from each index on (Primary / Secondary…). */
  parts?: { label: string; from: number }[];
  layers: GameMapLayer[];
}

const TRACKING = 'Interface\\Minimap\\Tracking\\';
const ICONS = 'Interface\\Icons\\';
/** The world map's icon atlas: graveyards, towers, flags, crests, zeppelins, anchors… 14 icons of 16 pixels a row, 18 apart. */
export const POI_ATLAS = 'Interface\\Minimap\\POIIcons.blp';
export const POI_ATLAS_COLUMNS = 14;
export const POI_ATLAS_PITCH = 18;
export const POI_ATLAS_CELL = 16;
/** Its cells used here. */
export const ATLAS = {
  graveyard: 8,
  allianceCrest: 46,
  hordeCrest: 48,
  zeppelin: { neutral: 140, alliance: 141, horde: 143 },
  boat: { neutral: 145, alliance: 146, horde: 148 },
};

/** Crossed swords (its top left quarter), the game's sign of a fight. */
const COMBAT_SWORDS = 'Interface\\WorldStateFrame\\CombatSwords.blp';

/** The layers shown on continents (as AoWoW's): how to get around and where the instances are. */
export const CONTINENT_LAYERS = new Set([
  'flight',
  'boat',
  'zeppelin',
  'gunship',
  'transport',
  'routes',
  'dungeon',
  'raid',
  'pvp',
  'relations',
]);

const tracking = (file: string): GameMapIcon => ({ path: `${TRACKING}${file}.blp` });
const square = (file: string): GameMapIcon => ({ path: `${ICONS}${file}.blp`, square: true });

/** Professions (SkillLine ids) with their icons; the first 11 primary, then secondary. */
export const PROFESSIONS: [number, string, string][] = [
  [171, 'WORLD_EDITOR.PROF_ALCHEMY', 'Trade_Alchemy'],
  [164, 'WORLD_EDITOR.PROF_BLACKSMITHING', 'Trade_BlackSmithing'],
  [333, 'WORLD_EDITOR.PROF_ENCHANTING', 'Trade_Engraving'],
  [202, 'WORLD_EDITOR.PROF_ENGINEERING', 'Trade_Engineering'],
  [182, 'WORLD_EDITOR.PROF_HERBALISM', 'Trade_Herbalism'],
  [773, 'WORLD_EDITOR.PROF_INSCRIPTION', 'INV_Inscription_Tradeskill01'],
  [755, 'WORLD_EDITOR.PROF_JEWELCRAFTING', 'INV_Misc_Gem_01'],
  [165, 'WORLD_EDITOR.PROF_LEATHERWORKING', 'Trade_LeatherWorking'],
  [186, 'WORLD_EDITOR.PROF_MINING', 'Trade_Mining'],
  [393, 'WORLD_EDITOR.PROF_SKINNING', 'INV_Misc_Pelt_Wolf_01'],
  [197, 'WORLD_EDITOR.PROF_TAILORING', 'Trade_Tailoring'],
  [185, 'WORLD_EDITOR.PROF_COOKING', 'INV_Misc_Food_15'],
  [129, 'WORLD_EDITOR.PROF_FIRST_AID', 'Spell_Holy_SealOfSacrifice'],
  [356, 'WORLD_EDITOR.PROF_FISHING', 'Trade_Fishing'],
];

/** The map's own layers (colours, borders, names…), apart from the markers. */
export const GAME_MAP_OPTIONS: GameMapLayer[] = [
  { key: 'levels', label: 'WORLD_EDITOR.GAME_MAP_LEVEL_COLOURS', shown: true },
  { key: 'territory', label: 'WORLD_EDITOR.GAME_MAP_TERRITORY', shown: false },
  { key: 'borders', label: 'WORLD_EDITOR.GAME_MAP_BORDERS', shown: true },
  { key: 'subBorders', label: 'WORLD_EDITOR.GAME_MAP_SUB_BORDERS', shown: true },
  { key: 'transitions', label: 'WORLD_EDITOR.GAME_MAP_TRANSITIONS', shown: true },
  { key: 'names', label: 'WORLD_EDITOR.GAME_MAP_NAMES', shown: true },
  { key: 'badges', label: 'WORLD_EDITOR.GAME_MAP_BADGES', shown: true },
  { key: 'camera', label: 'WORLD_EDITOR.GAME_MAP_CAMERA', shown: true },
  { key: 'spawns', label: 'WORLD_EDITOR.GAME_MAP_SPAWNS', shown: false },
];

export const GAME_MAP_LAYER_GROUPS: GameMapLayerGroup[] = [
  {
    key: 'townsfolk',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_TOWNSFOLK',
    layers: [
      { key: 'auction', label: 'WORLD_EDITOR.POI_AUCTION', icon: tracking('Auctioneer'), shown: true },
      { key: 'bank', label: 'WORLD_EDITOR.POI_BANK', icon: tracking('Banker'), shown: false },
      { key: 'barber', label: 'WORLD_EDITOR.POI_BARBER', icon: square('INV_Misc_Comb_02'), shown: false },
      { key: 'battle', label: 'WORLD_EDITOR.POI_BATTLE', icon: tracking('BattleMaster'), shown: false },
      { key: 'classTrainer', label: 'WORLD_EDITOR.POI_CLASS_TRAINER', icon: tracking('Class'), shown: false },
      { key: 'flight', label: 'WORLD_EDITOR.POI_FLIGHT', icon: tracking('FlightMaster'), shown: true },
      { key: 'inn', label: 'WORLD_EDITOR.POI_INN', icon: tracking('Innkeeper'), shown: false },
      { key: 'mailbox', label: 'WORLD_EDITOR.POI_MAILBOX', icon: tracking('Mailbox'), shown: false },
      { key: 'repair', label: 'WORLD_EDITOR.POI_REPAIR', icon: tracking('Repair'), shown: false },
      { key: 'riding', label: 'WORLD_EDITOR.POI_RIDING', icon: square('Ability_Mount_RidingHorse'), shown: false },
      { key: 'spirit', label: 'WORLD_EDITOR.POI_SPIRIT', icon: { path: POI_ATLAS, atlas: ATLAS.graveyard }, shown: true },
      { key: 'stable', label: 'WORLD_EDITOR.POI_STABLE', icon: tracking('StableMaster'), shown: false },
      { key: 'weaponMaster', label: 'WORLD_EDITOR.POI_WEAPON_MASTER', icon: square('INV_Sword_04'), shown: false },
    ],
  },
  {
    key: 'professions',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_PROFESSIONS',
    parts: [
      { label: 'WORLD_EDITOR.GAME_MAP_PRIMARY', from: 0 },
      { label: 'WORLD_EDITOR.GAME_MAP_SECONDARY', from: 11 },
    ],
    layers: PROFESSIONS.map(([skill, label, icon]) => ({ key: `prof:${skill}`, label, icon: square(icon), shown: false })),
  },
  {
    key: 'vendors',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_VENDORS',
    parts: [
      { label: 'WORLD_EDITOR.GAME_MAP_CONSUMABLES', from: 0 },
      { label: 'WORLD_EDITOR.GAME_MAP_SUPPLIES', from: 1 },
    ],
    layers: [
      { key: 'food', label: 'WORLD_EDITOR.POI_FOOD', icon: tracking('Food'), shown: false },
      { key: 'ammo', label: 'WORLD_EDITOR.POI_AMMO', icon: tracking('Ammunition'), shown: false },
      { key: 'poison', label: 'WORLD_EDITOR.POI_POISON', icon: tracking('Poisons'), shown: false },
      { key: 'reagent', label: 'WORLD_EDITOR.POI_REAGENT', icon: tracking('Reagents'), shown: false },
    ],
  },
  {
    key: 'travel',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_TRAVEL',
    layers: [
      { key: 'boat', label: 'WORLD_EDITOR.GAME_MAP_BOATS', icon: { path: POI_ATLAS, atlas: ATLAS.boat.neutral }, shown: true },
      { key: 'zeppelin', label: 'WORLD_EDITOR.GAME_MAP_ZEPPELINS', icon: { path: POI_ATLAS, atlas: ATLAS.zeppelin.neutral }, shown: true },
      { key: 'gunship', label: 'WORLD_EDITOR.GAME_MAP_GUNSHIPS', icon: { path: POI_ATLAS, atlas: ATLAS.zeppelin.neutral }, shown: true },
      { key: 'transport', label: 'WORLD_EDITOR.GAME_MAP_OTHER_TRANSPORTS', icon: { fa: 'fa-train', color: '#ffd200' }, shown: true },
      { key: 'routes', label: 'WORLD_EDITOR.GAME_MAP_ROUTES', icon: { fa: 'fa-ellipsis-h', color: '#ffd200' }, shown: true },
    ],
  },
  {
    key: 'locations',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_LOCATIONS',
    layers: [
      { key: 'stone', label: 'WORLD_EDITOR.POI_STONE', icon: square('Spell_Shadow_Teleport'), shown: true },
      { key: 'dungeon', label: 'WORLD_EDITOR.GAME_MAP_DUNGEONS', icon: { fa: 'fa-circle-o-notch', color: '#29b6f6' }, shown: true },
      { key: 'raid', label: 'WORLD_EDITOR.GAME_MAP_RAIDS', icon: { fa: 'fa-circle-o-notch', color: '#2ecc40' }, shown: true },
      { key: 'pvp', label: 'WORLD_EDITOR.GAME_MAP_WORLD_PVP', icon: { path: COMBAT_SWORDS, crop: [0, 0, 32, 32] }, shown: true },
      { key: 'relations', label: 'WORLD_EDITOR.GAME_MAP_RELATIONS', icon: { path: POI_ATLAS, atlas: ATLAS.allianceCrest }, shown: true },
    ],
  },
];

export const GAME_MAP_LAYERS: GameMapLayer[] = [...GAME_MAP_OPTIONS, ...GAME_MAP_LAYER_GROUPS.flatMap((group) => group.layers)];

/** Where the layers shown and the size of the markers are kept. */
export const GAME_MAP_LAYERS_KEY = 'keira3.worldEditor.gameMapLayers';
export const GAME_MAP_MARKER_KEY = 'keira3.worldEditor.gameMapMarkers';

/** The layers shown: as last chosen on this computer, else the default ones. */
export function loadShownLayers(): Set<string> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(GAME_MAP_LAYERS_KEY) ?? 'null');
    if (Array.isArray(stored)) {
      return new Set(GAME_MAP_LAYERS.map((layer) => layer.key).filter((key) => stored.includes(key)));
    }
  } catch {
    // (unreadable: the defaults)
  }
  return new Set(GAME_MAP_LAYERS.filter((layer) => layer.shown).map((layer) => layer.key));
}

export function saveShownLayers(keys: Set<string>): void {
  try {
    localStorage.setItem(GAME_MAP_LAYERS_KEY, JSON.stringify([...keys]));
  } catch {
    // (not kept)
  }
}

/** How big markers are drawn (pixels), as last chosen. */
export const MARKER_SIZES = [12, 16, 20, 26, 32];
export function loadMarkerSize(): number {
  try {
    const stored = Number(localStorage.getItem(GAME_MAP_MARKER_KEY));
    return MARKER_SIZES.includes(stored) ? stored : 20;
  } catch {
    return 20;
  }
}

export function saveMarkerSize(size: number): void {
  try {
    localStorage.setItem(GAME_MAP_MARKER_KEY, String(size));
  } catch {
    // (not kept)
  }
}

/** NPC flags (creature_template.npcflag) of the kinds; a trainer's kind comes from its trainer's type instead. */
export const NPC_FLAG_KINDS: [number, string][] = [
  [0x2000, 'flight'],
  [0x10000, 'inn'],
  [0x20000, 'bank'],
  [0x200000, 'auction'],
  [0x400000, 'stable'],
  [0x100000, 'battle'],
  [0x1000, 'repair'],
  [0x200, 'food'],
  [0x100, 'ammo'],
  [0x400, 'poison'],
  [0x800, 'reagent'],
  [0x4000 | 0x8000, 'spirit'],
];
/** UNIT_NPC_FLAG_TRAINER, and trainer.Type of class (0), riding (1) and profession (2) trainers. */
export const NPC_FLAG_TRAINER = 0x10;
export const TRAINER_CLASS = 0;
export const TRAINER_RIDING = 1;
export const TRAINER_PROFESSION = 2;
/** Gameobject types: mailbox (19) and meeting stone (23). */
export const GAMEOBJECT_MAILBOX = 19;
export const GAMEOBJECT_MEETING_STONE = 23;

/** The kinds a creature with these NPC flags (trainer type and skill, −1 for none; and its subname) is shown as. */
export function npcPoiKinds(npcFlags: number, trainerType: number, skill = 0, subname = ''): string[] {
  const kinds = NPC_FLAG_KINDS.filter(([flag]) => npcFlags & flag).map(([, kind]) => kind);
  // (no flag of their own)
  if (/^barber$/i.test(subname)) {
    kinds.push('barber');
  } else if (/^weapon master$/i.test(subname)) {
    kinds.push('weaponMaster');
  }
  if (npcFlags & NPC_FLAG_TRAINER) {
    if (trainerType === TRAINER_CLASS) {
      kinds.push('classTrainer');
    } else if (trainerType === TRAINER_RIDING) {
      kinds.push('riding');
    } else if (trainerType === TRAINER_PROFESSION && PROFESSIONS.some(([id]) => id === skill)) {
      kinds.push(`prof:${skill}`);
    }
  }
  return kinds;
}

/** The kind of a transport, by its name. */
export function transportKind(name: string): 'boat' | 'zeppelin' | 'gunship' | 'transport' {
  if (/gunship|skybreaker|orgrim's hammer/i.test(name)) {
    return 'gunship';
  }
  if (/zeppelin/i.test(name)) {
    return 'zeppelin';
  }
  return /boat|ship|bravery|mehley|moonspray|feathermoon|kraken|maiden|lady|galley|northspear|rabbit/i.test(name) ? 'boat' : 'transport';
}

/** Whose side a faction template serves: FactionGroup masks 2 (Alliance) and 4 (Horde). */
export function factionSide(template: FactionTemplate | undefined): 'alliance' | 'horde' | undefined {
  if (!template) {
    return undefined;
  }
  const friends = template.ourMask | template.friendMask;
  const alliance = (friends & 2) !== 0 && (template.enemyMask & 2) === 0;
  const horde = (friends & 4) !== 0 && (template.enemyMask & 4) === 0;
  return alliance && !horde ? 'alliance' : horde && !alliance ? 'horde' : undefined;
}
