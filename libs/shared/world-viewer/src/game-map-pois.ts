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

export interface GameMapLayer {
  key: string;
  /** i18n key of its name (or a name as it is). */
  label: string;
  /** A picture of the client, else a Font Awesome icon. */
  icon?: string;
  fa?: string;
  /** Shown before the user chooses. */
  shown: boolean;
}

export interface GameMapLayerGroup {
  key: string;
  label: string;
  layers: GameMapLayer[];
}

const TRACKING = 'Interface\\Minimap\\Tracking\\';
const ICONS = 'Interface\\Icons\\';

/** Professions (SkillLine ids) with their icons. */
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

export const GAME_MAP_LAYER_GROUPS: GameMapLayerGroup[] = [
  {
    key: 'map',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_MAP',
    layers: [
      { key: 'levels', label: 'WORLD_EDITOR.GAME_MAP_LEVEL_COLOURS', fa: 'fa-signal', shown: true },
      { key: 'territory', label: 'WORLD_EDITOR.GAME_MAP_TERRITORY', fa: 'fa-flag', shown: false },
      { key: 'borders', label: 'WORLD_EDITOR.GAME_MAP_BORDERS', fa: 'fa-square-o', shown: true },
      { key: 'subBorders', label: 'WORLD_EDITOR.GAME_MAP_SUB_BORDERS', fa: 'fa-th', shown: true },
      { key: 'names', label: 'WORLD_EDITOR.GAME_MAP_NAMES', fa: 'fa-font', shown: true },
      { key: 'camera', label: 'WORLD_EDITOR.GAME_MAP_CAMERA', fa: 'fa-video-camera', shown: true },
      { key: 'spawns', label: 'WORLD_EDITOR.GAME_MAP_SPAWNS', fa: 'fa-circle', shown: false },
    ],
  },
  {
    key: 'townsfolk',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_TOWNSFOLK',
    layers: [
      { key: 'auction', label: 'WORLD_EDITOR.POI_AUCTION', icon: `${TRACKING}Auctioneer.blp`, shown: true },
      { key: 'bank', label: 'WORLD_EDITOR.POI_BANK', icon: `${TRACKING}Banker.blp`, shown: false },
      { key: 'battle', label: 'WORLD_EDITOR.POI_BATTLE', icon: `${TRACKING}BattleMaster.blp`, shown: false },
      { key: 'classTrainer', label: 'WORLD_EDITOR.POI_CLASS_TRAINER', icon: `${TRACKING}Class.blp`, shown: false },
      { key: 'flight', label: 'WORLD_EDITOR.POI_FLIGHT', icon: `${TRACKING}FlightMaster.blp`, shown: true },
      { key: 'inn', label: 'WORLD_EDITOR.POI_INN', icon: `${TRACKING}Innkeeper.blp`, shown: false },
      { key: 'mailbox', label: 'WORLD_EDITOR.POI_MAILBOX', icon: `${TRACKING}Mailbox.blp`, shown: false },
      { key: 'repair', label: 'WORLD_EDITOR.POI_REPAIR', icon: `${TRACKING}Repair.blp`, shown: false },
      { key: 'riding', label: 'WORLD_EDITOR.POI_RIDING', icon: `${ICONS}Ability_Mount_RidingHorse.blp`, shown: false },
      { key: 'spirit', label: 'WORLD_EDITOR.POI_SPIRIT', icon: `${ICONS}Spell_Holy_Resurrection.blp`, shown: true },
      { key: 'stable', label: 'WORLD_EDITOR.POI_STABLE', icon: `${TRACKING}StableMaster.blp`, shown: false },
    ],
  },
  {
    key: 'professions',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_PROFESSIONS',
    layers: PROFESSIONS.map(([skill, label, icon]) => ({ key: `prof:${skill}`, label, icon: `${ICONS}${icon}.blp`, shown: false })),
  },
  {
    key: 'vendors',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_VENDORS',
    layers: [
      { key: 'food', label: 'WORLD_EDITOR.POI_FOOD', icon: `${TRACKING}Food.blp`, shown: false },
      { key: 'ammo', label: 'WORLD_EDITOR.POI_AMMO', icon: `${TRACKING}Ammunition.blp`, shown: false },
      { key: 'poison', label: 'WORLD_EDITOR.POI_POISON', icon: `${TRACKING}Poisons.blp`, shown: false },
      { key: 'reagent', label: 'WORLD_EDITOR.POI_REAGENT', icon: `${TRACKING}Reagents.blp`, shown: false },
    ],
  },
  {
    key: 'travel',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_TRAVEL',
    layers: [
      { key: 'boat', label: 'WORLD_EDITOR.GAME_MAP_BOATS', fa: 'fa-ship', shown: true },
      { key: 'zeppelin', label: 'WORLD_EDITOR.GAME_MAP_ZEPPELINS', fa: 'fa-plane', shown: true },
      { key: 'transport', label: 'WORLD_EDITOR.GAME_MAP_OTHER_TRANSPORTS', fa: 'fa-train', shown: true },
    ],
  },
  {
    key: 'locations',
    label: 'WORLD_EDITOR.GAME_MAP_GROUP_LOCATIONS',
    layers: [
      { key: 'dungeon', label: 'WORLD_EDITOR.GAME_MAP_DUNGEONS', icon: 'Interface\\LFGFrame\\LFGICON-DUNGEON.BLP', shown: true },
      { key: 'raid', label: 'WORLD_EDITOR.GAME_MAP_RAIDS', icon: 'Interface\\LFGFrame\\LFGICON-RAID.BLP', shown: true },
      { key: 'stone', label: 'WORLD_EDITOR.POI_STONE', icon: `${ICONS}Spell_Shadow_Teleport.blp`, shown: true },
    ],
  },
];

export const GAME_MAP_LAYERS: GameMapLayer[] = GAME_MAP_LAYER_GROUPS.flatMap((group) => group.layers);

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

/** The kinds a creature with these NPC flags (and trainer type and skill, −1 for none) is shown as. */
export function npcPoiKinds(npcFlags: number, trainerType: number, skill = 0): string[] {
  const kinds = NPC_FLAG_KINDS.filter(([flag]) => npcFlags & flag).map(([, kind]) => kind);
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
export function transportKind(name: string): 'boat' | 'zeppelin' | 'transport' {
  return /zeppelin/i.test(name)
    ? 'zeppelin'
    : /boat|ship|bravery|mehley|moonspray|feathermoon|kraken|maiden|lady|galley|northspear|rabbit/i.test(name) && !/gunship/i.test(name)
      ? 'boat'
      : 'transport';
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
