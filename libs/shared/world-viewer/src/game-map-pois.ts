/** What a point of interest on the game map is (townsfolk, travel, locations), like the game's tracking menu. */
export type GameMapPoiKind =
  | 'flight'
  | 'inn'
  | 'bank'
  | 'auction'
  | 'stable'
  | 'battle'
  | 'repair'
  | 'classTrainer'
  | 'professionTrainer'
  | 'food'
  | 'ammo'
  | 'poison'
  | 'reagent'
  | 'spirit'
  | 'mailbox'
  | 'stone';

/** A point of interest: a creature or object that serves players (a flight master, a mailbox…). */
export interface GameMapPoi {
  kind: GameMapPoiKind;
  mapId: number;
  x: number;
  y: number;
  z: number;
  name: string;
  subname?: string;
}

const TRACKING = 'Interface\\Minimap\\Tracking\\';

/** Each kind with its name (i18n key), its icon (a tracking icon of the client, else a Font Awesome one) and whether it is shown at first. */
export const GAME_MAP_POI_KINDS: { kind: GameMapPoiKind; label: string; icon?: string; fa?: string; shown: boolean }[] = [
  { kind: 'flight', label: 'WORLD_EDITOR.POI_FLIGHT', icon: `${TRACKING}FlightMaster.blp`, shown: true },
  { kind: 'inn', label: 'WORLD_EDITOR.POI_INN', icon: `${TRACKING}Innkeeper.blp`, shown: true },
  { kind: 'bank', label: 'WORLD_EDITOR.POI_BANK', icon: `${TRACKING}Banker.blp`, shown: false },
  { kind: 'auction', label: 'WORLD_EDITOR.POI_AUCTION', icon: `${TRACKING}Auctioneer.blp`, shown: false },
  { kind: 'stable', label: 'WORLD_EDITOR.POI_STABLE', icon: `${TRACKING}StableMaster.blp`, shown: false },
  { kind: 'battle', label: 'WORLD_EDITOR.POI_BATTLE', icon: `${TRACKING}BattleMaster.blp`, shown: false },
  { kind: 'repair', label: 'WORLD_EDITOR.POI_REPAIR', icon: `${TRACKING}Repair.blp`, shown: false },
  { kind: 'classTrainer', label: 'WORLD_EDITOR.POI_CLASS_TRAINER', icon: `${TRACKING}Class.blp`, shown: false },
  { kind: 'professionTrainer', label: 'WORLD_EDITOR.POI_PROFESSION_TRAINER', icon: `${TRACKING}Profession.blp`, shown: false },
  { kind: 'food', label: 'WORLD_EDITOR.POI_FOOD', icon: `${TRACKING}Food.blp`, shown: false },
  { kind: 'ammo', label: 'WORLD_EDITOR.POI_AMMO', icon: `${TRACKING}Ammunition.blp`, shown: false },
  { kind: 'poison', label: 'WORLD_EDITOR.POI_POISON', icon: `${TRACKING}Poisons.blp`, shown: false },
  { kind: 'reagent', label: 'WORLD_EDITOR.POI_REAGENT', icon: `${TRACKING}Reagents.blp`, shown: false },
  { kind: 'mailbox', label: 'WORLD_EDITOR.POI_MAILBOX', icon: `${TRACKING}Mailbox.blp`, shown: false },
  { kind: 'spirit', label: 'WORLD_EDITOR.POI_SPIRIT', fa: 'fa-heartbeat', shown: true },
  { kind: 'stone', label: 'WORLD_EDITOR.POI_STONE', fa: 'fa-cube', shown: false },
];

/** Where the kinds shown on the game map are kept. */
export const GAME_MAP_POIS_KEY = 'keira3.worldEditor.gameMapPois';

/** The kinds shown: as last chosen on this computer, else the default ones. */
export function loadShownPois(): Set<GameMapPoiKind> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(GAME_MAP_POIS_KEY) ?? 'null');
    if (Array.isArray(stored)) {
      return new Set(GAME_MAP_POI_KINDS.map((k) => k.kind).filter((kind) => stored.includes(kind)));
    }
  } catch {
    // (unreadable: the defaults)
  }
  return new Set(GAME_MAP_POI_KINDS.filter((k) => k.shown).map((k) => k.kind));
}

export function saveShownPois(kinds: Set<GameMapPoiKind>): void {
  try {
    localStorage.setItem(GAME_MAP_POIS_KEY, JSON.stringify([...kinds]));
  } catch {
    // (not kept)
  }
}

/** NPC flags (creature_template.npcflag) of the kinds; a trainer's kind comes from its trainer's type instead. */
export const NPC_FLAG_KINDS: [number, GameMapPoiKind][] = [
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
/** UNIT_NPC_FLAG_TRAINER, and trainer.Type of class (0) and profession (2) trainers. */
export const NPC_FLAG_TRAINER = 0x10;
export const TRAINER_CLASS = 0;
export const TRAINER_PROFESSION = 2;
/** Gameobject types: mailbox (19) and meeting stone (23). */
export const GAMEOBJECT_MAILBOX = 19;
export const GAMEOBJECT_MEETING_STONE = 23;

/** The kinds a creature with these NPC flags (and trainer type, −1 for none) is shown as. */
export function npcPoiKinds(npcFlags: number, trainerType: number): GameMapPoiKind[] {
  const kinds = NPC_FLAG_KINDS.filter(([flag]) => npcFlags & flag).map(([, kind]) => kind);
  if (npcFlags & NPC_FLAG_TRAINER) {
    if (trainerType === TRAINER_CLASS) {
      kinds.push('classTrainer');
    } else if (trainerType === TRAINER_PROFESSION) {
      kinds.push('professionTrainer');
    }
  }
  return kinds;
}
