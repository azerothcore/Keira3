import { WorldBounds } from './coords';

/** Minimal reader for WotLK `WDBC` client database files (fixed 4-byte fields + string block). */
export class DbcFile {
  readonly recordCount: number;
  readonly fieldCount: number;
  readonly recordSize: number;
  private readonly view: DataView;
  private readonly bytes: Uint8Array;
  private readonly stringBlockOffset: number;
  private readonly decoder = new TextDecoder('utf-8');

  private static readonly HEADER_SIZE = 20;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const magic = String.fromCharCode(...bytes.subarray(0, 4));
    if (magic !== 'WDBC') {
      throw new Error(`Not a WDBC file (magic "${magic}")`);
    }
    this.recordCount = this.view.getUint32(4, true);
    this.fieldCount = this.view.getUint32(8, true);
    this.recordSize = this.view.getUint32(12, true);
    const stringBlockSize = this.view.getUint32(16, true);
    this.stringBlockOffset = DbcFile.HEADER_SIZE + this.recordCount * this.recordSize;
    if (this.stringBlockOffset + stringBlockSize > bytes.byteLength) {
      throw new Error('Truncated WDBC file');
    }
  }

  private offset(record: number, field: number): number {
    return DbcFile.HEADER_SIZE + record * this.recordSize + field * 4;
  }

  getUint(record: number, field: number): number {
    return this.view.getUint32(this.offset(record, field), true);
  }

  getInt(record: number, field: number): number {
    return this.view.getInt32(this.offset(record, field), true);
  }

  getFloat(record: number, field: number): number {
    return this.view.getFloat32(this.offset(record, field), true);
  }

  getString(record: number, field: number): string {
    const start = this.stringBlockOffset + this.getUint(record, field);
    let end = start;
    while (end < this.bytes.length && this.bytes[end] !== 0) {
      end++;
    }
    return this.decoder.decode(this.bytes.subarray(start, end));
  }
}

export interface WowMap {
  id: number;
  directory: string;
  name: string;
  /** 0 = open world, 1 = dungeon, 2 = raid, 3 = battleground, 4 = arena. */
  instanceType: number;
}

/** Map.dbc (3.3.5a layout): 0 ID, 1 Directory, 2 InstanceType, 5..20 MapName_lang. */
export function parseMapDbc(dbc: DbcFile): WowMap[] {
  const maps: WowMap[] = [];
  for (let record = 0; record < dbc.recordCount; record++) {
    let name = '';
    for (let field = 5; field <= 20 && !name; field++) {
      name = dbc.getString(record, field);
    }
    const directory = dbc.getString(record, 1);
    maps.push({ id: dbc.getUint(record, 0), directory, name: name || directory, instanceType: dbc.getUint(record, 2) });
  }
  return maps.sort((a, b) => a.id - b.id);
}

/** How a creature display id is drawn: its model, size and the textures for the model's replaceable slots. */
export interface CreatureDisplay {
  model: string;
  scale: number;
  /** Texture per replaceable slot (M2 texture component): 11..13 creature skins, 1 baked NPC skin, 6 hair. */
  textures: Record<number, string>;
  /** Character models (humanoid NPCs) only: the hair geoset to show; other optional geosets use their default. */
  hairGeoset?: number;
}

/** The DBCs `parseCreatureDisplays` reads; the character ones are optional (humanoids then use bare models). */
export interface CreatureDisplayDbcs {
  displays: DbcFile;
  models: DbcFile;
  extras?: DbcFile;
  hairGeosets?: DbcFile;
  charSections?: DbcFile;
}

const CHAR_SECTION_HAIR = 3;

/**
 * CreatureDisplayInfo.dbc (0 ID, 1 ModelID, 3 ExtendedDisplayInfoID, 4 CreatureModelScale, 6..8 TextureVariation),
 * CreatureModelData.dbc (0 ID, 2 ModelName, 4 ModelScale) and, for humanoids, CreatureDisplayInfoExtra.dbc
 * (1 Race, 2 Sex, 5 HairStyle, 6 HairColor, 20 BakeName), CharHairGeosets.dbc (1 Race, 2 Sex, 3 Variation, 4 Geoset)
 * and CharSections.dbc (1 Race, 2 Sex, 3 Section, 4 Texture, 8 Variation, 9 Color).
 */
export function parseCreatureDisplays(dbcs: CreatureDisplayDbcs): Map<number, CreatureDisplay> {
  const models = new Map<number, { path: string; scale: number }>();
  for (let r = 0; r < dbcs.models.recordCount; r++) {
    models.set(dbcs.models.getUint(r, 0), { path: dbcs.models.getString(r, 2), scale: dbcs.models.getFloat(r, 4) || 1 });
  }
  const extras = new Map<number, number>();
  for (let r = 0; r < (dbcs.extras?.recordCount ?? 0); r++) {
    extras.set((dbcs.extras as DbcFile).getUint(r, 0), r);
  }
  const hairGeosets = new Map<string, number>();
  for (let r = 0; r < (dbcs.hairGeosets?.recordCount ?? 0); r++) {
    const dbc = dbcs.hairGeosets as DbcFile;
    hairGeosets.set(`${dbc.getUint(r, 1)}:${dbc.getUint(r, 2)}:${dbc.getUint(r, 3)}`, dbc.getUint(r, 4));
  }
  const hairTextures = new Map<string, string>();
  for (let r = 0; r < (dbcs.charSections?.recordCount ?? 0); r++) {
    const dbc = dbcs.charSections as DbcFile;
    const key = `${dbc.getUint(r, 1)}:${dbc.getUint(r, 2)}:${dbc.getUint(r, 8)}:${dbc.getUint(r, 9)}`;
    const texture = dbc.getString(r, 4);
    if (dbc.getUint(r, 3) === CHAR_SECTION_HAIR && texture && !hairTextures.has(key)) {
      hairTextures.set(key, texture);
    }
  }

  const displays = new Map<number, CreatureDisplay>();
  const dbc = dbcs.displays;
  for (let r = 0; r < dbc.recordCount; r++) {
    const model = models.get(dbc.getUint(r, 1));
    if (!model?.path) {
      continue;
    }
    const directory = model.path.slice(0, model.path.lastIndexOf('\\') + 1);
    const textures: Record<number, string> = {};
    [6, 7, 8].forEach((field, i) => {
      const variation = dbc.getString(r, field);
      if (variation) {
        textures[11 + i] = `${directory}${variation}.blp`;
      }
    });
    const display: CreatureDisplay = { model: model.path, scale: (dbc.getFloat(r, 4) || 1) * model.scale, textures };
    const extraRecord = extras.get(dbc.getUint(r, 3));
    if (extraRecord !== undefined) {
      const extra = dbcs.extras as DbcFile;
      const [race, sex, style, color] = [1, 2, 5, 6].map((field) => extra.getUint(extraRecord, field));
      const bake = extra.getString(extraRecord, 20);
      if (bake) {
        textures[1] = `Textures\\BakedNpcTextures\\${bake}`;
      }
      const hair = hairTextures.get(`${race}:${sex}:${style}:${color}`);
      if (hair) {
        textures[6] = hair;
      }
      display.hairGeoset = hairGeosets.get(`${race}:${sex}:${style}`) ?? 1;
    }
    displays.set(dbc.getUint(r, 0), display);
  }
  return displays;
}

/** The playable races (ChrRaces ids) and the folder of their character models. */
export const PLAYER_RACES: { id: number; name: string; folder: string }[] = [
  { id: 1, name: 'Human', folder: 'Human' },
  { id: 2, name: 'Orc', folder: 'Orc' },
  { id: 3, name: 'Dwarf', folder: 'Dwarf' },
  { id: 4, name: 'Night Elf', folder: 'NightElf' },
  { id: 5, name: 'Undead', folder: 'Scourge' },
  { id: 6, name: 'Tauren', folder: 'Tauren' },
  { id: 7, name: 'Gnome', folder: 'Gnome' },
  { id: 8, name: 'Troll', folder: 'Troll' },
  { id: 10, name: 'Blood Elf', folder: 'BloodElf' },
  { id: 11, name: 'Draenei', folder: 'Draenei' },
];

const CHAR_SECTION_SKIN = 0;

/**
 * A player character as a display: the race's model for the sex (0 male, 1 female) with the first skin colour, hair
 * style and hair colour of CharSections.dbc / CharHairGeosets.dbc (no clothes); undefined for a race not playable.
 */
export function playerDisplay(race: number, sex: number, charSections?: DbcFile, hairGeosets?: DbcFile): CreatureDisplay | undefined {
  const folder = PLAYER_RACES.find((r) => r.id === race)?.folder;
  if (!folder) {
    return undefined;
  }
  const gender = sex === 1 ? 'Female' : 'Male';
  const textures: Record<number, string> = {};
  for (let r = 0; r < (charSections?.recordCount ?? 0); r++) {
    const dbc = charSections as DbcFile;
    const section = dbc.getUint(r, 3);
    const first = dbc.getUint(r, 8) === 0 && dbc.getUint(r, 9) === 0;
    if (dbc.getUint(r, 1) !== race || dbc.getUint(r, 2) !== sex || !first) {
      continue;
    }
    const slot = section === CHAR_SECTION_SKIN ? 1 : section === CHAR_SECTION_HAIR ? 6 : undefined;
    const texture = dbc.getString(r, 4);
    if (slot !== undefined && texture && !textures[slot]) {
      textures[slot] = texture;
    }
  }
  let hairGeoset = 1;
  for (let r = 0; r < (hairGeosets?.recordCount ?? 0); r++) {
    const dbc = hairGeosets as DbcFile;
    if (dbc.getUint(r, 1) === race && dbc.getUint(r, 2) === sex && dbc.getUint(r, 3) === 0) {
      hairGeoset = dbc.getUint(r, 4) || 1;
    }
  }
  return { model: `Character\\${folder}\\${gender}\\${folder}${gender}.m2`, scale: 1, textures, hairGeoset };
}

/** An area trigger of AreaTrigger.dbc: a sphere of `radius`, or a box when its length, width and height are set. */
export interface AreaTriggerInfo {
  id: number;
  mapId: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  box?: { length: number; width: number; height: number; orientation: number };
}

/** AreaTrigger.dbc: 0 ID, 1 Map, 2-4 position, 5 radius, 6 box length, 7 width, 8 height, 9 orientation. */
export function parseAreaTriggers(dbc: DbcFile): AreaTriggerInfo[] {
  const triggers: AreaTriggerInfo[] = [];
  for (let r = 0; r < dbc.recordCount; r++) {
    const [length, width, height] = [6, 7, 8].map((field) => dbc.getFloat(r, field));
    triggers.push({
      id: dbc.getUint(r, 0),
      mapId: dbc.getUint(r, 1),
      x: dbc.getFloat(r, 2),
      y: dbc.getFloat(r, 3),
      z: dbc.getFloat(r, 4),
      radius: dbc.getFloat(r, 5),
      ...(length > 0 && width > 0 && height > 0 ? { box: { length, width, height, orientation: dbc.getFloat(r, 9) } } : {}),
    });
  }
  return triggers;
}

/** An area (AreaTable.dbc): its name and its parent zone (0 for zones). */
export interface AreaName {
  name: string;
  parent: number;
}

/** AreaTable.dbc: 0 ID, 2 ParentAreaID, 11..26 AreaName_lang (the first filled locale). */
export function parseAreaNames(dbc: DbcFile): Map<number, AreaName> {
  const areas = new Map<number, AreaName>();
  for (let r = 0; r < dbc.recordCount; r++) {
    let name = '';
    for (let field = 11; field <= 26 && !name; field++) {
      name = dbc.getString(r, field);
    }
    areas.set(dbc.getUint(r, 0), { name, parent: dbc.getUint(r, 2) });
  }
  return areas;
}

/** A flight master's node (TaxiNodes.dbc). */
export interface TaxiNode {
  id: number;
  mapId: number;
  x: number;
  y: number;
  z: number;
  name: string;
}

/** TaxiNodes.dbc: 0 ID, 1 ContinentID, 2-4 position, 5..20 Name_lang. */
export function parseTaxiNodes(dbc: DbcFile): TaxiNode[] {
  const nodes: TaxiNode[] = [];
  for (let r = 0; r < dbc.recordCount; r++) {
    let name = '';
    for (let field = 5; field <= 20 && !name; field++) {
      name = dbc.getString(r, field);
    }
    nodes.push({
      id: dbc.getUint(r, 0),
      mapId: dbc.getUint(r, 1),
      x: dbc.getFloat(r, 2),
      y: dbc.getFloat(r, 3),
      z: dbc.getFloat(r, 4),
      name,
    });
  }
  return nodes;
}

/** A flight path (TaxiPath.dbc) with its points on one map (TaxiPathNode.dbc), in order. */
export interface TaxiPath {
  id: number;
  from: number;
  to: number;
  points: { x: number; y: number; z: number }[];
}

/**
 * TaxiPath.dbc (0 ID, 1 FromTaxiNode, 2 ToTaxiNode) and TaxiPathNode.dbc (0 ID, 1 PathID, 2 NodeIndex, 3 ContinentID,
 * 4-6 position): the paths with points on `mapId`, each with those points in order.
 */
export function parseTaxiPaths(paths: DbcFile, nodes: DbcFile, mapId: number): TaxiPath[] {
  const byPath = new Map<number, { index: number; x: number; y: number; z: number }[]>();
  for (let r = 0; r < nodes.recordCount; r++) {
    if (nodes.getUint(r, 3) !== mapId) {
      continue;
    }
    const path = nodes.getUint(r, 1);
    const point = { index: nodes.getUint(r, 2), x: nodes.getFloat(r, 4), y: nodes.getFloat(r, 5), z: nodes.getFloat(r, 6) };
    byPath.set(path, [...(byPath.get(path) ?? []), point]);
  }
  const result: TaxiPath[] = [];
  for (let r = 0; r < paths.recordCount; r++) {
    const points = byPath.get(paths.getUint(r, 0));
    if (points) {
      result.push({
        id: paths.getUint(r, 0),
        from: paths.getUint(r, 1),
        to: paths.getUint(r, 2),
        points: points.sort((a, b) => a.index - b.index).map(({ x, y, z }) => ({ x, y, z })),
      });
    }
  }
  return result;
}

/** GameObjectDisplayInfo.dbc: 0 ID, 1 ModelName → model path by display id. */
export function parseGameObjectDisplays(dbc: DbcFile): Map<number, string> {
  const displays = new Map<number, string>();
  for (let r = 0; r < dbc.recordCount; r++) {
    const model = dbc.getString(r, 1);
    if (model) {
      displays.set(dbc.getUint(r, 0), model);
    }
  }
  return displays;
}

/**
 * Which geosets of a character model are drawn: the body (0), the NPC's hair style, and the first (default) geoset
 * of every other group (facial hair, ears, sleeves, legs…); the rest are alternatives for gear and customisation.
 */
export function isDefaultCharacterGeoset(geoset: number, hairGeoset: number): boolean {
  if (geoset === 0) {
    return true;
  }
  return geoset < 100 ? geoset === hairGeoset : geoset % 100 === 1;
}

/** A zone (Elwynn Forest, Durotar…) of a map, with the bounds of its world map. */
export interface WowZone {
  areaId: number;
  mapId: number;
  name: string;
  bounds: WorldBounds;
}

/**
 * WorldMapArea.dbc (0 ID, 1 Map, 2 AreaID, 3 internal name, 4 LocLeft = max y, 5 LocRight = min y, 6 LocTop = max x,
 * 7 LocBottom = min x), named from AreaTable.dbc (0 ID, 11..26 AreaName_lang) when given. Continent maps (area 0)
 * are left out; zones are sorted by name.
 */
export function parseZones(worldMapAreas: DbcFile, areaTable?: DbcFile): WowZone[] {
  const names = new Map<number, string>();
  for (let r = 0; r < (areaTable?.recordCount ?? 0); r++) {
    const dbc = areaTable as DbcFile;
    let name = '';
    for (let field = 11; field <= 26 && !name; field++) {
      name = dbc.getString(r, field);
    }
    names.set(dbc.getUint(r, 0), name);
  }
  const zones: WowZone[] = [];
  for (let r = 0; r < worldMapAreas.recordCount; r++) {
    const areaId = worldMapAreas.getUint(r, 2);
    if (areaId === 0) {
      continue;
    }
    const [maxY, minY, maxX, minX] = [4, 5, 6, 7].map((field) => worldMapAreas.getFloat(r, field));
    zones.push({
      areaId,
      mapId: worldMapAreas.getUint(r, 1),
      name: names.get(areaId) || worldMapAreas.getString(r, 3),
      bounds: { minX, maxX, minY, maxY },
    });
  }
  return zones.sort((a, b) => a.name.localeCompare(b.name));
}
