import { inject, Service } from '@angular/core';
import { ItemDisplay, parseItemDbc, parseItemDisplays } from './character';
import { m2AnimPath, m2Sequences, M2Skeleton } from './m2-animation';
import { TileCoord, tileKey, WorldBounds, worldToTile } from './coords';
import {
  AreaTriggerInfo,
  CreatureDisplay,
  DbcFile,
  AreaName,
  parseAreaNames,
  parseAreaTriggers,
  parseTaxiNodes,
  parseTaxiPaths,
  TaxiNode,
  TaxiPath,
  parseCreatureDisplays,
  playerDisplay,
  parseGameObjectDisplays,
  parseMapDbc,
  parseMapDifficulties,
  MapDifficulty,
  parseZones,
  WowMap,
  WowZone,
} from './dbc';
import { BossBoundary, parseBossScripts, parseInstanceBoundaries, parseMapConstants } from './boss-boundaries';
import { FolderArchive } from './folder-archive';
import { GpuTexture, ParsedAdt, parseWdt, RgbaImage, WdtInfo } from './formats';
import { MD5_TRANSLATE_PATH, MINIMAP_ROOT, minimapKey, parseMd5Translate } from './minimap';
import { parseConfigWtfLocale, pickLocale, sortMpqArchives } from './mpq-order';
import { LiquidMesh } from './liquid';
import { parseSkyboxes, parseZoneLights, ZoneLight } from './light';
import { M2Mesh, m2Path, m2SkinPath } from './m2';
import { TerrainChunkMesh, TerrainMeshData } from './terrain-mesh';
import { ModelPlacement, WmoDoodads, wmoDoodadPlacements, WmoModel, wmoGroupPath } from './wmo';
import { mmtileName, NavMeshTile, parseMmtile } from './navmesh';
import { parseServerMap, serverMapName, ServerMapTile } from './server-map';
import { parseVmapModel, parseVmapTile, VmapGroup, vmapTileName, VmapSpawn } from './vmap';
import { clientIdentity, WowDataCacheService } from './wow-data-cache.service';
import { WowDataSettingsService } from './wow-data-settings.service';
import { StormArchive, WOW_NATIVE_API, WowNativeApi } from './wow-native-api';
import { WOW_PARSER } from './wow-parser';
import { logFact, perfNote, perfTime } from './perf-log';
import {
  composeGameMap,
  GameMapData,
  GameMapOverlay,
  GameZone,
  GameMapPicture,
  GameMapPiece,
  GamePage,
  GAME_MAP_ROOT,
  overlayPieces,
  pageTiles,
  parseGameMapAreas,
  parseGameMapFloors,
  parseGameMapOverlays,
  parseGameMapTransforms,
  parseGameZones,
} from './game-map';
import { FactionData, parseFactions, parseFactionTemplates } from './factions';

/** Disk space used by the cache of this client: per map (by lower-case directory), for buildings, and in total. */
export interface CacheUsage {
  maps: { directory: string; tiles: number; bytes: number }[];
  buildingBytes: number;
  /** Creature, gameobject and doodad models, and what's inside buildings. */
  modelBytes: number;
  /** Textures, as the graphics card takes them. */
  textureBytes: number;
  totalBytes: number;
}

/** Everything drawn for a tile in detailed mode. */
export interface TerrainDetail {
  chunks: TerrainChunkMesh[];
  liquids: LiquidMesh[];
}

type CachedAdt = ParsedAdt & { liquids: LiquidMesh[] };

const ADT_CACHE_SIZE = 64;

interface OpenClient {
  clientPath: string;
  mountpoint: string;
  /** Highest priority first. */
  archives: StormArchive[];
  archiveNames: string[];
  /** Names this client's entries in the disk cache. */
  identity: string;
}

/** The server files of a tile: terrain (`.map`), collision (`.vmtile`) and navigation mesh (`.mmtile`). */
export interface ServerTileCoverage {
  map: boolean;
  vmap: boolean;
  mmap: boolean;
}

/** Server terrain tiles kept parsed. */
const SERVER_MAP_CACHE = 9;

/** Where parsed models are cached: a new name when what's kept of them changes (v3: each batch's opacity). */
const M2_CACHE = 'm2-v3';
/** Where parsed tiles are cached (v2: their arrays no longer hold on to the whole file they were read from). */
const ADT_CACHE = 'adt-v2';
/** Where models' skeletons and animations are cached. */
const SKELETON_CACHE = 'm2-skeleton-v1';
/** Item.dbc InventoryType of a shield. */
const INVENTORY_TYPE_SHIELD = 14;
/** Particle emitters (smoke, fire, sparks…): a placeholder mesh the game never draws. */
const EMITTER_MODEL = /emitter[^\\]*\.m2$|\\particleemitters\\/i;

/** Where world map pictures are cached. */
const GAME_MAP_KIND = 'game-map-2';
/** World map pictures kept in memory. */
const GAME_PICTURES_KEPT = 12;

/** Reads game data straight from the user's WoW 3.3.5a client (MPQ archives) and, optionally, the server's DataDir. */
@Service()
export class WowClientService {
  private readonly native = inject(WOW_NATIVE_API);
  private readonly settings = inject(WowDataSettingsService);
  /** Parses game files in a background worker (on the main thread outside the desktop app). */
  private readonly parser = inject(WOW_PARSER);
  private readonly cache = inject(WowDataCacheService);

  private client?: Promise<OpenClient>;
  private minimapIndex?: Promise<Map<string, string>>;
  private maps?: Promise<WowMap[]>;
  private mapDifficulties?: Promise<Map<number, MapDifficulty[]>>;
  private creatureDisplays?: Promise<Map<number, CreatureDisplay>>;
  private factionData?: Promise<FactionData>;
  private gameobjectDisplays?: Promise<Map<number, string>>;
  private characterDbcs?: Promise<(DbcFile | undefined)[]>;
  private bossBoundaries?: { source: string; all: Promise<BossBoundary[]> };
  private zoneLights?: Promise<Map<number, ZoneLight[]>>;
  private zones?: Promise<WowZone[]>;
  private areaTriggers?: Promise<AreaTriggerInfo[]>;
  private readonly wdts = new Map<string, Promise<WdtInfo | undefined>>();
  private readonly adts = new Map<string, Promise<CachedAdt | undefined>>();
  private readonly wmoDoodads = new Map<string, Promise<WmoDoodads | undefined>>();
  private readonly vmapModels = new Map<string, Promise<VmapGroup[] | undefined>>();
  private readonly serverMaps = new Map<string, Promise<ServerMapTile | undefined>>();
  private areaNames?: Promise<Map<number, AreaName>>;
  private gameMap?: Promise<GameMapData>;
  private taxiNodes?: Promise<TaxiNode[]>;
  private mountCounter = 0;

  /** False in the browser build: reading local game files needs Electron. */
  isSupported(): boolean {
    return this.native !== undefined;
  }

  /** The memory Keira's window takes and the computer's in all (bytes); undefined outside the desktop app. */
  memoryUsage(): { used: number; total: number } | undefined {
    return this.native?.memoryUsage();
  }

  /** The graphics card's memory (bytes), read once; undefined when it can't be told (or outside the desktop app). */
  graphicsMemory(): Promise<number | undefined> {
    this.gpuMemory ??= this.native ? this.native.graphicsMemory() : Promise.resolve(undefined);
    return this.gpuMemory;
  }
  private gpuMemory?: Promise<number | undefined>;

  /**
   * Lets go of what was read and kept in memory (terrain tiles, building doodads, server maps and collision): read
   * again (from the disk cache) when needed. For when Keira takes more memory than allowed.
   */
  trimMemory(): void {
    this.adts.clear();
    this.wmoDoodads.clear();
    this.vmapModels.clear();
    this.serverMaps.clear();
  }

  /** Archives currently in use, lowest priority first (for diagnostics). */
  async getArchiveNames(): Promise<string[]> {
    return [...(await this.getClient()).archiveNames];
  }

  /** Reads a file from the highest-priority archive containing it. */
  async readFile(path: string): Promise<Uint8Array | undefined> {
    const { archives } = await this.getClient();
    for (const archive of archives) {
      if (archive.hasFile(path)) {
        const file = archive.openFile(path);
        try {
          // StormJS returns a view into WebAssembly memory that close() frees and later reads reuse: copy it.
          return perfTime('mpq read', () => file.read().slice());
        } finally {
          file.close();
        }
      }
    }
    return undefined;
  }

  /** Maps from the server's `dbc/Map.dbc` when configured (keeps custom maps), otherwise from the client. */
  getMaps(): Promise<WowMap[]> {
    this.maps ??= this.loadMaps().catch((error) => {
      this.maps = undefined;
      throw error;
    });
    return this.maps;
  }

  /** The difficulties of an instance (MapDifficulty.dbc, from the server's DBCs when configured); none for the rest. */
  async getMapDifficulties(mapId: number): Promise<MapDifficulty[]> {
    this.mapDifficulties ??= this.readDbc('MapDifficulty.dbc')
      .then((dbc) => (dbc ? parseMapDifficulties(dbc) : new Map<number, MapDifficulty[]>()))
      .catch((error) => {
        this.mapDifficulties = undefined;
        throw error;
      });
    return (await this.mapDifficulties).get(mapId) ?? [];
  }

  /** How a creature display id is drawn (model, size, textures), from the server's DBCs when configured. */
  async getCreatureDisplay(displayId: number): Promise<CreatureDisplay | undefined> {
    this.creatureDisplays ??= this.loadCreatureDisplays().catch((error) => {
      this.creatureDisplays = undefined;
      throw error;
    });
    return (await this.creatureDisplays).get(displayId);
  }

  /**
   * Boss boundaries of a map, read from the instance scripts of the AzerothCore source folder (empty without one, or
   * outside the desktop app). The scripts are read once.
   */
  async getBossBoundaries(mapId: number): Promise<BossBoundary[]> {
    const source = this.settings.paths().sourcePath;
    if (!source || !this.native) {
      return [];
    }
    if (this.bossBoundaries?.source !== source) {
      const all = this.readBossBoundaries(this.native, source).catch((error) => {
        // (read again next time)
        this.bossBoundaries = undefined;
        throw error;
      });
      this.bossBoundaries = { source, all };
    }
    return (await this.bossBoundaries.all).filter((boundary) => boundary.mapId === mapId);
  }

  private async readBossBoundaries(native: WowNativeApi, source: string): Promise<BossBoundary[]> {
    // the clone of azerothcore-wotlk, or its src folder
    const base = [`${source}/src/server`, `${source}/server`].find((path) => native.isDirectory(`${path}/scripts`));
    if (!base) {
      return [];
    }
    const text = (path: string) => new TextDecoder().decode(native.readFile(path));
    const defines = `${base}/game/Maps/AreaDefines.h`;
    const maps = native.exists(defines) ? parseMapConstants(text(defines)) : new Map<string, number>();
    const walk = (dir: string): string[] =>
      native.readdir(dir).flatMap((name) => (native.isDirectory(`${dir}/${name}`) ? walk(`${dir}/${name}`) : [`${dir}/${name}`]));
    const files = walk(`${base}/scripts`).filter((path) => path.endsWith('.cpp'));
    const boundaries: BossBoundary[] = [];
    for (const file of files.filter((path) => /\/instance_\w+\.cpp$/.test(path))) {
      const parsed = parseInstanceBoundaries(text(file));
      const mapId = parsed && (maps.get(parsed.map) ?? Number(parsed.map));
      if (!parsed || !Number.isInteger(mapId)) {
        continue;
      }
      // the creatures using each boss's boundary, from the scripts of the instance's folder
      await nextFrame();
      const folder = file.slice(0, file.lastIndexOf('/'));
      const scripts = new Map<string, string[]>();
      for (const other of files.filter((path) => path.startsWith(`${folder}/`))) {
        for (const [boss, names] of parseBossScripts(text(other))) {
          scripts.set(boss, [...new Set([...(scripts.get(boss) ?? []), ...names])]);
        }
      }
      const instance = (file.split('/').pop() as string).replace(/\.cpp$/, '');
      for (const { boss, shape } of parsed.entries) {
        const existing = boundaries.find((b) => b.mapId === mapId && b.boss === boss);
        if (existing) {
          existing.shapes.push(shape);
        } else {
          boundaries.push({ mapId: mapId as number, instance, boss, shapes: [shape], scriptNames: scripts.get(boss) ?? [] });
        }
      }
    }
    return boundaries;
  }

  /** A playable race's character (sex 0 male, 1 female) as a display: model, first skin and hair; no clothes. */
  async getPlayerDisplay(race: number, sex: number): Promise<CreatureDisplay | undefined> {
    this.characterDbcs ??= Promise.all([this.readDbc('CharSections.dbc'), this.readDbc('CharHairGeosets.dbc')]).catch(() => {
      this.characterDbcs = undefined;
      return [undefined, undefined];
    });
    const [charSections, hairGeosets] = await this.characterDbcs;
    return playerDisplay(race, sex, charSections, hairGeosets);
  }

  /** Faction templates and factions (who can interact with what), from the server's DBCs when configured. */
  getFactions(): Promise<FactionData> {
    this.factionData ??= Promise.all([this.readDbc('FactionTemplate.dbc'), this.readDbc('Faction.dbc')])
      .then(([templates, factions]) => ({
        templates: templates ? parseFactionTemplates(templates) : new Map(),
        factions: factions ? parseFactions(factions) : new Map(),
      }))
      .catch((error) => {
        this.factionData = undefined;
        throw error;
      });
    return this.factionData;
  }

  /** Model path of a gameobject display id. */
  async getGameObjectDisplay(displayId: number): Promise<string | undefined> {
    this.gameobjectDisplays ??= this.readDbc('GameObjectDisplayInfo.dbc')
      .then((dbc) => (dbc ? parseGameObjectDisplays(dbc) : new Map<number, string>()))
      .catch((error) => {
        this.gameobjectDisplays = undefined;
        throw error;
      });
    return (await this.gameobjectDisplays).get(displayId);
  }

  /** Zones of a map (from the world map's DBCs), by name. */
  async getZones(mapId: number): Promise<WowZone[]> {
    const zones = (this.zones ??= Promise.all([this.readDbc('WorldMapArea.dbc'), this.readDbc('AreaTable.dbc')])
      .then(([areas, names]) => (areas ? parseZones(areas, names) : []))
      .catch((error) => {
        this.zones = undefined;
        throw error;
      }));
    return (await zones).filter((zone) => zone.mapId === mapId);
  }

  /** Area triggers of a map (AreaTrigger.dbc, from the server's DBCs when configured). */
  async getAreaTriggers(mapId: number): Promise<AreaTriggerInfo[]> {
    const triggers = (this.areaTriggers ??= this.readDbc('AreaTrigger.dbc')
      .then((dbc) => (dbc ? parseAreaTriggers(dbc) : []))
      .catch((error) => {
        this.areaTriggers = undefined;
        throw error;
      }));
    return (await triggers).filter((trigger) => trigger.mapId === mapId);
  }

  /**
   * A tile of the server's navigation mesh (`<server data>/mmaps`), for the map with that directory; undefined without
   * a server data folder, or when the tile has no mmtile (or an unreadable one).
   */
  async getNavMeshTile(directory: string, tile: TileCoord): Promise<NavMeshTile | undefined> {
    const native = this.requireNative();
    const serverDataPath = this.settings.paths().serverDataPath;
    const map = (await this.getMaps()).find((m) => m.directory.toLowerCase() === directory.toLowerCase());
    const path = map && serverDataPath ? `${serverDataPath}/mmaps/${mmtileName(map.id, tile)}` : undefined;
    if (!path || !native.exists(path)) {
      return undefined;
    }
    try {
      return parseMmtile(native.readFile(path));
    } catch (error) {
      console.warn(`[World Editor] Could not read ${path}: ${(error as Error).message}`);
      return undefined;
    }
  }

  /** A tile of the server's terrain and liquids (`<server data>/maps`); undefined without a server data folder or that file. */
  getServerMap(mapId: number, tile: TileCoord): Promise<ServerMapTile | undefined> {
    const name = serverMapName(mapId, tile);
    // the few most recently used tiles (the area under the camera asks for the same one often): a hit goes last again
    const map = this.serverMaps.get(name) ?? new Promise((resolve) => resolve(this.readServerFile(`maps/${name}`, parseServerMap)));
    this.serverMaps.delete(name);
    this.serverMaps.set(name, map);
    if (this.serverMaps.size > SERVER_MAP_CACHE) {
      this.serverMaps.delete(this.serverMaps.keys().next().value as string);
    }
    return map;
  }

  /**
   * Which server files exist for each tile (`maps/`, `vmaps/`, `mmaps/` of the server data folder), by `tileKey`;
   * empty without a server data folder (or outside the desktop app).
   */
  getServerCoverage(mapId: number, tiles: TileCoord[]): Map<string, ServerTileCoverage> {
    const coverage = new Map<string, ServerTileCoverage>();
    const serverDataPath = this.settings.paths().serverDataPath;
    const native = this.native;
    if (!serverDataPath || !native) {
      return coverage;
    }
    for (const tile of tiles) {
      coverage.set(tileKey(tile), {
        map: native.exists(`${serverDataPath}/maps/${serverMapName(mapId, tile)}`),
        vmap: native.exists(`${serverDataPath}/vmaps/${vmapTileName(mapId, tile)}`),
        mmap: native.exists(`${serverDataPath}/mmaps/${mmtileName(mapId, tile)}`),
      });
    }
    return coverage;
  }

  /** Area names (AreaTable.dbc) with their parent zone, by area id. */
  async getAreaNames(): Promise<Map<number, AreaName>> {
    this.areaNames ??= this.readDbc('AreaTable.dbc')
      .then((dbc) => (dbc ? parseAreaNames(dbc) : new Map<number, AreaName>()))
      .catch((error) => {
        this.areaNames = undefined;
        throw error;
      });
    return this.areaNames;
  }

  /**
   * What the in-game world map is made of (its DBCs: pages, overlays, floors, zones with their levels), from the client
   * first: patches that add maps (dungeon maps, caves) change these DBCs, and the server doesn't need them.
   */
  getGameMap(): Promise<GameMapData> {
    this.gameMap ??= Promise.all(
      ['WorldMapArea', 'WorldMapOverlay', 'DungeonMap', 'WorldMapTransforms', 'AreaTable', 'LFGDungeons'].map((name) =>
        this.readClientDbc(`${name}.dbc`),
      ),
    )
      .then(([areas, overlays, floors, transforms, areaTable, lfg]) => {
        const data = {
          areas: areas ? parseGameMapAreas(areas) : [],
          overlays: overlays ? parseGameMapOverlays(overlays) : [],
          floors: floors ? parseGameMapFloors(floors) : [],
          transforms: transforms ? parseGameMapTransforms(transforms) : [],
          zones: areaTable ? parseGameZones(areaTable, lfg) : new Map<number, GameZone>(),
        };
        logFact('game map', `${data.areas.length} world maps, ${data.floors.length} floors, ${data.overlays.length} overlays`);
        return data;
      })
      .catch((error) => {
        this.gameMap = undefined;
        throw error;
      });
    return this.gameMap;
  }

  /**
   * The picture of a world map page (1002 × 668): its tiles with, on a zone, every sub-zone it lights up once explored
   * (`overlays` of that zone) and where each one is. Undefined when the client has none of its tiles. Kept in the disk
   * cache, and the last few in memory.
   */
  getGameMapPicture(page: GamePage, overlays: GameMapOverlay[] = []): Promise<GameMapPicture | undefined> {
    const key = page.prefix;
    const picture =
      this.gamePictures.get(key) ??
      this.loadGameMapPicture(page, overlays).catch((error) => {
        this.gamePictures.delete(key);
        throw error;
      });
    this.gamePictures.delete(key);
    this.gamePictures.set(key, picture);
    if (this.gamePictures.size > GAME_PICTURES_KEPT) {
      this.gamePictures.delete(this.gamePictures.keys().next().value as string);
    }
    return picture;
  }
  private readonly gamePictures = new Map<string, Promise<GameMapPicture | undefined>>();

  private async loadGameMapPicture(page: GamePage, overlays: GameMapOverlay[]): Promise<GameMapPicture | undefined> {
    const { identity } = await this.getClient();
    const started = performance.now();
    const cached = await this.cache.read<GameMapPicture>(identity, GAME_MAP_KIND, page.prefix);
    if (cached) {
      return cached;
    }
    const tiles = await Promise.all(pageTiles(page).map((path) => this.getTexture(path).catch(() => undefined)));
    if (!tiles.some(Boolean)) {
      return undefined;
    }
    const folder = page.prefix.slice(0, page.prefix.indexOf('\\') + 1);
    const pieces: GameMapPiece[] = [];
    for (const [index, overlay] of overlays.entries()) {
      for (const piece of overlayPieces(overlay)) {
        const image = await this.getTexture(`${GAME_MAP_ROOT}${folder}${overlay.texture}${piece.index}.blp`).catch(() => undefined);
        if (image) {
          pieces.push({ image, x: piece.x, y: piece.y, label: Math.min(255, index + 1) });
        }
      }
    }
    const picture = composeGameMap(tiles, pieces);
    perfNote(`game map: drew ${page.prefix} (${pieces.length} overlay pieces) in ${Math.round(performance.now() - started)} ms`);
    void this.cache.write(identity, GAME_MAP_KIND, page.prefix, picture);
    return picture;
  }

  /** Flight masters' nodes (TaxiNodes.dbc) of a map. */
  async getTaxiNodes(mapId: number): Promise<TaxiNode[]> {
    this.taxiNodes ??= this.readDbc('TaxiNodes.dbc')
      .then((dbc) => (dbc ? parseTaxiNodes(dbc) : []))
      .catch((error) => {
        this.taxiNodes = undefined;
        throw error;
      });
    return (await this.taxiNodes).filter((node) => node.mapId === mapId);
  }

  /** Flight paths (TaxiPath.dbc, TaxiPathNode.dbc) with their points on a map. */
  async getTaxiPaths(mapId: number): Promise<TaxiPath[]> {
    // (read once)
    this.taxiPathDbcs ??= Promise.all([this.readDbc('TaxiPath.dbc'), this.readDbc('TaxiPathNode.dbc')]).catch((error) => {
      this.taxiPathDbcs = undefined;
      throw error;
    });
    const [paths, nodes] = await this.taxiPathDbcs;
    return paths && nodes ? parseTaxiPaths(paths, nodes, mapId) : [];
  }
  private taxiPathDbcs?: Promise<[DbcFile | undefined, DbcFile | undefined]>;
  private skyboxDbc?: Promise<DbcFile | undefined>;

  /** The models placed in a tile of the server's vmaps (`<server data>/vmaps`); undefined without that file. */
  getVmapTile(mapId: number, tile: TileCoord): Promise<VmapSpawn[] | undefined> {
    return new Promise((resolve) => resolve(this.readServerFile(`vmaps/${vmapTileName(mapId, tile)}`, parseVmapTile)));
  }

  /** A model of the server's vmaps (kept in memory: the same few models are placed many times). */
  getVmapModel(name: string): Promise<VmapGroup[] | undefined> {
    let model = this.vmapModels.get(name);
    if (!model) {
      model = new Promise((resolve) => resolve(this.readServerFile(`vmaps/${name}.vmo`, parseVmapModel)));
      this.vmapModels.set(name, model);
    }
    return model;
  }

  /** Reads and parses a file of the server data folder; undefined without the folder, the file, or when unreadable. */
  private readServerFile<T>(relative: string, parse: (bytes: Uint8Array) => T): T | undefined {
    const serverDataPath = this.settings.paths().serverDataPath;
    if (!serverDataPath) {
      return undefined;
    }
    const native = this.requireNative();
    const path = `${serverDataPath}/${relative}`;
    if (!native.exists(path)) {
      return undefined;
    }
    try {
      return parse(native.readFile(path));
    } catch (error) {
      console.warn(`[World Editor] Could not read ${path}: ${(error as Error).message}`);
      return undefined;
    }
  }

  /** Zone lights (Light.dbc) of a map, by its directory; empty when the map or the light DBCs are unknown. */
  async getZoneLights(directory: string): Promise<ZoneLight[]> {
    const lights = (this.zoneLights ??= this.loadZoneLights().catch((error) => {
      this.zoneLights = undefined;
      throw error;
    }));
    const map = (await this.getMaps()).find((m) => m.directory.toLowerCase() === directory.toLowerCase());
    return (map && (await lights).get(map.id)) ?? [];
  }

  /** The map's tiles; a map made of one building (a dungeon) has the tile under it, which holds the building. */
  async getMapTiles(directory: string): Promise<TileCoord[]> {
    const wdt = await this.getWdt(directory);
    if (wdt?.tiles.length) {
      return wdt.tiles;
    }
    return wdt?.wmo ? [buildingTile(wdt)] : [];
  }

  /** The one building of a map made of a single building instead of terrain (most dungeons and raids). */
  async getMapBuilding(
    directory: string,
  ): Promise<{ placement: ModelPlacement; bounds: WorldBounds & { minZ: number; maxZ: number } } | undefined> {
    const wdt = await this.getWdt(directory);
    return wdt?.wmo && !wdt.tiles.length
      ? { placement: wdt.wmo, bounds: wdt.wmoBounds as WorldBounds & { minZ: number; maxZ: number } }
      : undefined;
  }

  /** The buildings of a tile: those its ADT places, or the map's one building for its tile (dungeons have no ADTs). */
  private async tileWmos(directory: string, tile: TileCoord, adt: CachedAdt | undefined): Promise<ModelPlacement[]> {
    if (adt) {
      return adt.wmos;
    }
    const wdt = await this.getWdt(directory);
    return wdt?.wmo && tileKey(buildingTile(wdt)) === tileKey(tile) ? [wdt.wmo] : [];
  }

  /** Low-detail terrain of a tile: one mesh for the whole tile, textured with its minimap. */
  async getTerrain(directory: string, tile: TileCoord): Promise<TerrainMeshData | undefined> {
    await nextFrame();
    const adt = await this.getAdt(directory, tile);
    // (only what the mesh is made of goes to the worker: not the texture layers and their alpha maps)
    const chunks = adt?.chunks.map(({ position, vertexHeights, holes }) => ({ position, vertexHeights, holes }));
    return chunks && this.parser.run({ kind: 'terrain', tile, chunks });
  }

  /** Textured terrain of a tile: one mesh per chunk with its texture layers, plus its liquid surfaces. */
  async getTerrainDetail(directory: string, tile: TileCoord): Promise<TerrainDetail | undefined> {
    await nextFrame();
    const adt = await this.getAdt(directory, tile);
    return adt && { chunks: await this.parser.run({ kind: 'terrainDetail', chunks: adt.chunks }), liquids: adt.liquids };
  }

  /** Buildings and doodads placed by a tile; the doodads include those inside its buildings (furniture, barrels…). */
  async getTilePlacements(directory: string, tile: TileCoord): Promise<{ wmos: ModelPlacement[]; doodads: ModelPlacement[] } | undefined> {
    const adt = await this.getAdt(directory, tile);
    const wmos = await this.tileWmos(directory, tile, adt);
    if (!adt && wmos.length === 0) {
      return undefined;
    }
    const inside = await Promise.all(
      wmos.map(async (wmo) => {
        const info = await this.getWmoDoodads(wmo.path).catch((error: Error) => {
          console.warn(`[World Editor] Could not read the doodads of ${wmo.path}: ${error.message}`);
          return undefined;
        });
        return info ? wmoDoodadPlacements(wmo, info) : [];
      }),
    );
    return { wmos, doodads: [...(adt?.doodads ?? []), ...inside.flat()] };
  }

  /** The doodads and doodad sets of a building, read from its root file only. */
  private getWmoDoodads(path: string): Promise<WmoDoodads | undefined> {
    const key = path.toLowerCase();
    let doodads = this.wmoDoodads.get(key);
    if (!doodads) {
      const loading = this.loadWmoDoodads(path);
      // (only this load: a newer one may be kept under the key by then)
      loading.catch(() => this.wmoDoodads.get(key) === loading && this.wmoDoodads.delete(key));
      doodads = loading;
      this.wmoDoodads.set(key, doodads);
    }
    return doodads;
  }

  private async loadWmoDoodads(path: string): Promise<WmoDoodads | undefined> {
    const { identity } = await this.getClient();
    const cached = await this.cache.read<WmoDoodads>(identity, 'wmo-doodads', path);
    if (cached) {
      return cached;
    }
    const bytes = await this.readFile(path);
    const doodads = bytes && (await this.parser.run({ kind: 'wmoDoodads', bytes }));
    if (doodads) {
      void this.cache.write(identity, 'wmo-doodads', path, doodads);
    }
    return doodads;
  }

  /** A building (WMO root and all its groups). */
  async getWmo(path: string): Promise<WmoModel | undefined> {
    await nextFrame();
    const { identity } = await this.getClient();
    const cached = await this.cache.read<WmoModel>(identity, 'wmo', path);
    // buildings cached before their collision was kept are read again
    if (cached && cached.groups.every((group) => group.collision)) {
      return cached;
    }
    const model = await this.loadWmo(path);
    if (model) {
      void this.cache.write(identity, 'wmo', path, model);
    }
    return model;
  }

  async cacheUsage(): Promise<CacheUsage> {
    const { identity } = await this.getClient();
    const maps = new Map<string, { directory: string; tiles: number; bytes: number }>();
    const [adt, wmo, m2, doodads, textures, totalBytes] = await Promise.all([
      ...[ADT_CACHE, 'wmo', M2_CACHE, 'wmo-doodads', 'texture'].map((kind) => this.cache.entries(identity, kind)),
      this.cache.size(),
    ]);
    for (const [key, bytes] of Object.entries(adt as Record<string, number>)) {
      const directory = key.replace(/_\d+_\d+$/, '');
      const usage = maps.get(directory) ?? { directory, tiles: 0, bytes: 0 };
      usage.tiles++;
      usage.bytes += bytes;
      maps.set(directory, usage);
    }
    const sum = (sizes: Record<string, number> | number): number =>
      Object.values(sizes as Record<string, number>).reduce((total, bytes) => total + bytes, 0);
    return {
      maps: [...maps.values()],
      buildingBytes: sum(wmo),
      modelBytes: sum(m2) + sum(doodads),
      textureBytes: sum(textures),
      totalBytes: totalBytes as number,
    };
  }

  /**
   * Processes the given tiles of a map and the buildings on them into the disk cache ahead of time, so they load fast
   * later. `onProgress` gets the steps done and the steps known so far; `cancelled` is checked between steps.
   * Stops when the cache is full, and then returns false.
   */
  async preload(
    directory: string,
    tiles: TileCoord[],
    onProgress: (done: number, total: number) => void = () => undefined,
    cancelled: () => boolean = () => false,
  ): Promise<boolean> {
    const { identity } = await this.getClient();
    const buildings = new Set<string>();
    const models = new Set<string>();
    const textures = new Set<string>();
    const addTexture = (path: string | undefined) => path && textures.add(path.toLowerCase());
    let done = 0;
    let total = tiles.length;
    /** Runs the steps one by one; false when the cache got full, true otherwise (also when cancelled). */
    const run = async <T>(items: T[], step: (item: T) => Promise<unknown>): Promise<boolean | undefined> => {
      for (const item of items) {
        if (this.cache.isFull()) {
          return false;
        }
        if (cancelled()) {
          return true;
        }
        await step(item);
        onProgress(++done, total);
        await nextFrame();
      }
      return undefined;
    };
    const warn = (what: string) => (error: Error) => console.warn(`[World Editor] Could not preload ${what}: ${error.message}`);

    // the tiles, listing their buildings and doodads
    const tilesEnd = await run(tiles, async (tile) => {
      const adt = await this.loadAdt(directory, tile).catch(warn(`${directory}_${tile.tx}_${tile.ty}`));
      (await this.tileWmos(directory, tile, adt ?? undefined)).forEach((wmo) => buildings.add(wmo.path.toLowerCase()));
      adt?.doodads.forEach((doodad) => models.add(m2Path(doodad.path).toLowerCase()));
      adt?.chunks.forEach((chunk) => (chunk.layers ?? []).forEach((layer) => addTexture(layer.texture)));
    });
    if (tilesEnd !== undefined) {
      return tilesEnd;
    }
    // the buildings and the list of what's inside them
    total += buildings.size;
    const buildingsEnd = await run([...buildings], async (path) => {
      // (from the cache when there: its textures are listed too)
      const building = await this.getWmo(path).catch(warn(path));
      building?.materials.forEach((material) => addTexture(material.texture));
      const inside = await this.getWmoDoodads(path).catch(warn(path));
      inside?.doodads.forEach((doodad) => models.add(m2Path(doodad.path).toLowerCase()));
    });
    if (buildingsEnd !== undefined) {
      return buildingsEnd;
    }
    // the models of the doodads (trees, rocks, furniture…), and their textures
    total += models.size;
    const modelsEnd = await run([...models], async (path) => {
      const model = await this.getM2(path).catch(warn(path));
      model?.batches.forEach((batch) => addTexture(batch.texture));
    });
    if (modelsEnd !== undefined) {
      return modelsEnd;
    }
    // every texture of all that, as the graphics card takes them
    const missing = [...textures].filter((path) => !this.cache.has(identity, 'texture', path));
    total += missing.length;
    return (await run(missing, (path) => this.getGpuTexture(path).catch(warn(path)))) ?? true;
  }

  private async loadWmo(path: string): Promise<WmoModel | undefined> {
    const rootBytes = await this.readFile(path);
    if (!rootBytes) {
      return undefined;
    }
    const root = await this.parser.run({ kind: 'wmoRoot', bytes: rootBytes });
    const groups: WmoModel['groups'] = [];
    for (const [index, info] of root.groups.entries()) {
      const bytes = await this.readFile(wmoGroupPath(path, index));
      if (bytes) {
        groups.push(await this.parser.run({ kind: 'wmoGroup', bytes, rootFlags: root.flags, indoor: info.indoor }));
      }
    }
    return { materials: root.materials, groups };
  }

  /** A model (doodad, creature, gameobject): `.mdx`/`.mdl` names are read as `.m2`. */
  async getM2(path: string): Promise<M2Mesh | undefined> {
    await nextFrame();
    const { identity } = await this.getClient();
    const key = m2Path(path);
    const cached = await this.cache.read<M2Mesh>(identity, M2_CACHE, key);
    if (cached?.collision) {
      return cached;
    }
    const model = await this.readFile(key);
    const skin = model && (await this.readFile(m2SkinPath(path)));
    const parsed = model && skin ? await this.parser.run({ kind: 'm2', model, skin }) : undefined;
    // the mesh of a particle emitter only places its particles: the game doesn't draw it (some aren't faded out)
    const mesh =
      parsed && EMITTER_MODEL.test(key) ? { ...parsed, batches: parsed.batches.map((batch) => ({ ...batch, alpha: 0 })) } : parsed;
    if (mesh) {
      void this.cache.write(identity, M2_CACHE, key, mesh);
    }
    return mesh;
  }

  /**
   * The bones and the standing and walking animations of a model (reading the `.anim` files they're kept in), for
   * creatures and characters; undefined for a model without bones or that can't be read.
   */
  async getM2Skeleton(path: string): Promise<M2Skeleton | undefined> {
    const { identity } = await this.getClient();
    const key = m2Path(path);
    const cached = await this.cache.read<{ skeleton?: M2Skeleton }>(identity, SKELETON_CACHE, key);
    if (cached) {
      return cached.skeleton;
    }
    const model = await this.readFile(key);
    const skin = model && (await this.readFile(m2SkinPath(path)));
    if (!model || !skin) {
      return undefined;
    }
    const refs = m2Sequences(model);
    const anims = new Map<number, Uint8Array>();
    for (const ref of refs.filter((r) => r.external)) {
      const file = await this.readFile(m2AnimPath(key, ref));
      if (file) {
        anims.set(ref.index, file);
      }
    }
    const skeleton = await this.parser.run({ kind: 'm2Skeleton', model, skin, refs, anims });
    void this.cache.write(identity, SKELETON_CACHE, key, { skeleton });
    return skeleton;
  }

  /** How an item looks when held (Item.dbc → ItemDisplayInfo.dbc), and whether it's a shield. */
  async getItemDisplay(itemId: number): Promise<{ display: ItemDisplay; shield: boolean } | undefined> {
    this.itemData ??= Promise.all([this.readDbc('Item.dbc'), this.readDbc('ItemDisplayInfo.dbc')])
      .then(([items, displays]) => ({
        items: items ? parseItemDbc(items) : new Map<number, { displayId: number; inventoryType: number }>(),
        displays: displays ? parseItemDisplays(displays) : new Map<number, ItemDisplay>(),
      }))
      .catch((error) => {
        this.itemData = undefined;
        throw error;
      });
    const { items, displays } = await this.itemData;
    const item = items.get(itemId);
    const display = item && displays.get(item.displayId);
    return display && { display, shield: item.inventoryType === INVENTORY_TYPE_SHIELD };
  }
  private itemData?: Promise<{ items: Map<number, { displayId: number; inventoryType: number }>; displays: Map<number, ItemDisplay> }>;

  /** Decodes a BLP texture from the archives (e.g. a terrain tileset texture). */
  async getTexture(path: string): Promise<RgbaImage | undefined> {
    const blp = await this.readFile(path);
    return blp ? this.parser.run({ kind: 'blp', bytes: blp }) : undefined;
  }

  /** A texture as the graphics card takes it (DXT mip levels as they are), from the disk cache when there. */
  async getGpuTexture(path: string): Promise<GpuTexture | undefined> {
    const { identity } = await this.getClient();
    const key = path.toLowerCase();
    const cached = await this.cache.read<GpuTexture>(identity, 'texture', key);
    if (cached) {
      return cached;
    }
    const blp = await this.readFile(path);
    const texture = blp && (await this.parser.run({ kind: 'blpGpu', bytes: blp }));
    if (texture) {
      void this.cache.write(identity, 'texture', key, texture);
    }
    return texture;
  }

  /** Parsed ADTs are kept for the few most recent tiles: terrain, liquids and placements share one parse. */
  private getAdt(directory: string, tile: TileCoord): Promise<CachedAdt | undefined> {
    const key = `${directory}_${tile.tx}_${tile.ty}`.toLowerCase();
    let adt = this.adts.get(key);
    if (adt) {
      // refresh its position in the LRU order
      this.adts.delete(key);
    } else {
      const loading = this.loadAdt(directory, tile);
      // (only this load: a newer one may be kept under the key by then)
      loading.catch(() => this.adts.get(key) === loading && this.adts.delete(key));
      adt = loading;
    }
    this.adts.set(key, adt);
    while (this.adts.size > ADT_CACHE_SIZE) {
      this.adts.delete(this.adts.keys().next().value as string);
    }
    return adt;
  }

  /** A parsed tile, from the disk cache when there, otherwise read from the archives (and then cached). */
  private async loadAdt(directory: string, tile: TileCoord): Promise<CachedAdt | undefined> {
    const { identity } = await this.getClient();
    const key = `${directory}_${tile.tx}_${tile.ty}`;
    // reading and parsing a tile is synchronous: one at a time, so the window keeps drawing in between
    await nextFrame();
    const cached = await this.cache.read<CachedAdt>(identity, ADT_CACHE, key);
    // tiles cached before buildings kept their doodad set are parsed again
    if (cached && cached.wmos.every((wmo) => wmo.doodadSet !== undefined)) {
      return cached;
    }
    const bytes = await this.readFile(`World\\Maps\\${directory}\\${key}.adt`);
    if (!bytes) {
      return undefined;
    }
    const adt = await this.parser.run({ kind: 'adt', bytes, depth: (await this.getWdt(directory))?.layerSplatDepth ?? 4 });
    void this.cache.write(identity, ADT_CACHE, key, adt);
    return adt;
  }

  private getWdt(directory: string): Promise<WdtInfo | undefined> {
    const key = directory.toLowerCase();
    let wdt = this.wdts.get(key);
    if (!wdt) {
      wdt = this.readFile(`World\\Maps\\${directory}\\${directory}.wdt`).then((bytes) => (bytes ? parseWdt(bytes) : undefined));
      wdt.catch(() => this.wdts.delete(key));
      this.wdts.set(key, wdt);
    }
    return wdt;
  }

  async getMinimap(directory: string, tile: TileCoord): Promise<RgbaImage | undefined> {
    const hashed = (await this.getMinimapIndex()).get(minimapKey(directory, tile));
    const blp = hashed ? await this.readFile(`${MINIMAP_ROOT}${hashed}`) : undefined;
    return blp ? this.parser.run({ kind: 'blp', bytes: blp }) : undefined;
  }

  /**
   * A small picture of a whole map (its minimaps side by side, about `MAP_THUMBNAIL_SIZE` pixels across), for the
   * world map's list of every map; kept in the disk cache. Undefined for maps without minimaps (most dungeons).
   */
  async getMapThumbnail(directory: string): Promise<RgbaImage | undefined> {
    const { identity } = await this.getClient();
    const cached = await this.cache.read<RgbaImage>(identity, MAP_PICTURE_KIND, directory);
    if (cached) {
      return cached;
    }
    const tiles = await this.getMapTiles(directory);
    if (tiles.length === 0) {
      return undefined;
    }
    const [minX, minY] = [Math.min(...tiles.map((t) => t.tx)), Math.min(...tiles.map((t) => t.ty))];
    const [columns, rows] = [Math.max(...tiles.map((t) => t.tx)) - minX + 1, Math.max(...tiles.map((t) => t.ty)) - minY + 1];
    const per = Math.max(1, Math.floor(MAP_THUMBNAIL_SIZE / Math.max(columns, rows)));
    const thumbnail: RgbaImage = { width: columns * per, height: rows * per, data: new Uint8Array(columns * per * rows * per * 4) };
    let drawn = false;
    for (const tile of tiles) {
      const image = await this.getMinimap(directory, tile).catch(() => undefined);
      if (image) {
        drawn = true;
        blit(image, thumbnail, (tile.tx - minX) * per, (tile.ty - minY) * per, per);
      }
    }
    if (!drawn) {
      return undefined;
    }
    void this.cache.write(identity, MAP_PICTURE_KIND, directory, thumbnail);
    return thumbnail;
  }

  /** Closes the archives; the next read reopens them (e.g. after the client path changed). */
  async close(): Promise<void> {
    const client = this.client;
    this.client = undefined;
    this.minimapIndex = undefined;
    this.maps = undefined;
    this.mapDifficulties = undefined;
    this.creatureDisplays = undefined;
    this.gameobjectDisplays = undefined;
    this.zoneLights = undefined;
    this.zones = undefined;
    this.areaTriggers = undefined;
    this.wdts.clear();
    this.adts.clear();
    this.wmoDoodads.clear();
    this.vmapModels.clear();
    this.serverMaps.clear();
    this.areaNames = undefined;
    this.taxiNodes = undefined;
    this.taxiPathDbcs = undefined;
    this.skyboxDbc = undefined;
    this.factionData = undefined;
    this.characterDbcs = undefined;
    this.itemData = undefined;
    if (!client) {
      return;
    }
    try {
      const { archives, mountpoint } = await client;
      archives.forEach((archive) => archive.close());
      this.requireNative().loadStorm().FS.unmount(mountpoint);
    } catch {
      // Opening failed: nothing to release.
    }
  }

  private requireNative(): WowNativeApi {
    if (!this.native) {
      throw new Error('Reading WoW game files is only available in the Keira3 desktop app.');
    }
    return this.native;
  }

  private getClient(): Promise<OpenClient> {
    const clientPath = this.settings.paths().clientPath;
    if (this.client) {
      return this.client.then((client) => (client.clientPath === clientPath ? client : this.close().then(() => this.getClient())));
    }
    this.client = this.openClient(clientPath).catch((error) => {
      this.client = undefined;
      throw error;
    });
    return this.client;
  }

  private async openClient(clientPath: string): Promise<OpenClient> {
    const native = this.requireNative();
    if (!clientPath) {
      throw new Error('Set the WoW client folder in the World Editor settings first.');
    }
    const dataPath = `${clientPath}/Data`;
    if (!native.isDirectory(dataPath)) {
      throw new Error(`No "Data" folder found in ${clientPath}. Pick the folder that contains Wow.exe.`);
    }

    const entries = native.readdir(dataPath);
    const configWtf = `${clientPath}/WTF/Config.wtf`;
    const preferredLocale = native.exists(configWtf)
      ? parseConfigWtfLocale(new TextDecoder().decode(native.readFile(configWtf)))
      : undefined;
    const locale = pickLocale(
      entries.filter((entry) => native.isDirectory(`${dataPath}/${entry}`)),
      preferredLocale,
    );
    const candidates = [...entries, ...(locale ? native.readdir(`${dataPath}/${locale}`).map((name) => `${locale}/${name}`) : [])];
    const archiveNames = sortMpqArchives(candidates, locale ?? '');
    if (archiveNames.length === 0) {
      throw new Error(`No WoW 3.3.5a MPQ archives found in ${dataPath}.`);
    }

    // (timed for the performance log: opening the archives can freeze the app for seconds)
    const began = performance.now();
    const storm = perfTime('load StormLib', () => native.loadStorm());
    const mountpoint = `/keira-wow-${++this.mountCounter}`;
    storm.FS.mkdir(mountpoint);
    storm.FS.mount(storm.FS.filesystems.NODEFS, { root: dataPath }, mountpoint);

    const archives: StormArchive[] = [];
    const opened: string[] = [];
    for (const name of archiveNames) {
      try {
        const folder = `${dataPath}/${name}`;
        archives.unshift(
          native.isDirectory(folder) ? new FolderArchive(native, folder) : await storm.MPQ.open(`${mountpoint}/${name}`, 'r'),
        );
        opened.push(name);
      } catch (error) {
        // The game skips archives it can't read too; one bad patch shouldn't hide the rest of the world.
        console.warn(`[World Editor] Skipping ${name}: ${(error as Error).message}`);
      }
    }
    if (archives.length === 0) {
      storm.FS.unmount(mountpoint);
      throw new Error(`None of the MPQ archives in ${dataPath} could be opened.`);
    }
    logFact(
      'game client',
      `${clientPath} | locale ${locale ?? 'none'}${preferredLocale && preferredLocale !== locale ? ` (Config.wtf asks for ${preferredLocale})` : ''} | ` +
        `${opened.length} of ${archiveNames.length} archives opened in ${(performance.now() - began).toFixed(0)}ms, lowest priority first: ` +
        opened.join(', '),
    );
    return { clientPath, mountpoint, archives, archiveNames: opened, identity: clientIdentity(clientPath, opened) };
  }

  private getMinimapIndex(): Promise<Map<string, string>> {
    this.minimapIndex ??= this.readFile(MD5_TRANSLATE_PATH)
      .then((trs) => (trs ? parseMd5Translate(new TextDecoder().decode(trs)) : new Map<string, string>()))
      .catch((error) => {
        // (tried again next time)
        this.minimapIndex = undefined;
        throw error;
      });
    return this.minimapIndex;
  }

  private async loadMaps(): Promise<WowMap[]> {
    const dbc = await this.readDbc('Map.dbc');
    if (!dbc) {
      throw new Error('Map.dbc not found in the client or server data.');
    }
    return parseMapDbc(dbc);
  }

  private async loadCreatureDisplays(): Promise<Map<number, CreatureDisplay>> {
    const [displays, models, extras, hairGeosets, charSections, itemDisplays, facialHair, helmetVis] = await Promise.all(
      [
        'CreatureDisplayInfo',
        'CreatureModelData',
        'CreatureDisplayInfoExtra',
        'CharHairGeosets',
        'CharSections',
        'ItemDisplayInfo',
        'CharacterFacialHairStyles',
        'HelmetGeosetVisData',
      ].map((name) => this.readDbc(`${name}.dbc`)),
    );
    return displays && models
      ? parseCreatureDisplays({ displays, models, extras, hairGeosets, charSections, itemDisplays, facialHair, helmetVis })
      : new Map();
  }

  private async loadZoneLights(): Promise<Map<number, ZoneLight[]>> {
    const [lights, intBands, floatBands, params, skyboxes] = await Promise.all(
      ['Light', 'LightIntBand', 'LightFloatBand', 'LightParams', 'LightSkybox'].map((name) => this.readDbc(`${name}.dbc`)),
    );
    return lights && intBands && floatBands ? parseZoneLights(lights, intBands, floatBands, params, skyboxes) : new Map();
  }

  /** Every skybox model of the client (LightSkybox.dbc), as .m2 paths, sorted and without repeats. */
  async getSkyboxes(): Promise<string[]> {
    const dbc = await (this.skyboxDbc ??= this.readDbc('LightSkybox.dbc').catch((error) => {
      this.skyboxDbc = undefined;
      throw error;
    }));
    const paths = dbc ? [...parseSkyboxes(dbc).values()] : [];
    const unique = new Map(paths.map((path) => [path.toLowerCase(), path]));
    return [...unique.values()].sort((a, b) => a.localeCompare(b));
  }

  /** A DBC from the server's DataDir when configured (it may hold custom rows), otherwise from the client. */
  /** A DBC from the client; the server's when the client has none or a damaged one. */
  private async readClientDbc(name: string): Promise<DbcFile | undefined> {
    const bytes = await this.readFile(`DBFilesClient\\${name}`);
    if (bytes) {
      try {
        return new DbcFile(bytes);
      } catch (error) {
        console.warn(`[World Editor] The client's ${name} can't be read, using the server's:`, error);
      }
    }
    const native = this.requireNative();
    const serverDataPath = this.settings.paths().serverDataPath;
    const serverDbc = `${serverDataPath}/dbc/${name}`;
    return serverDataPath && native.exists(serverDbc) ? new DbcFile(native.readFile(serverDbc)) : undefined;
  }

  private async readDbc(name: string): Promise<DbcFile | undefined> {
    const native = this.requireNative();
    const serverDataPath = this.settings.paths().serverDataPath;
    const serverDbc = `${serverDataPath}/dbc/${name}`;
    const bytes = serverDataPath && native.exists(serverDbc) ? native.readFile(serverDbc) : await this.readFile(`DBFilesClient\\${name}`);
    return bytes ? new DbcFile(bytes) : undefined;
  }
}

/** The tile holding a map's one building: the one in the middle of where it stands. */
function buildingTile(wdt: WdtInfo): TileCoord {
  const { minX, maxX, minY, maxY } = wdt.wmoBounds as WorldBounds;
  return worldToTile((minX + maxX) / 2, (minY + maxY) / 2);
}

/**
 * Lets the window repaint (3D view, progress bars, clicks on Cancel) between pieces of long, mostly synchronous work.
 * A message, not a timer: timers of a window in the background are slowed down to one a second, then one a minute,
 * which stalled preloading while Keira wasn't in front.
 */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(undefined);
  });
}

/** Pixels across a map's thumbnail (about: each tile gets a whole number of pixels). */
export const MAP_THUMBNAIL_SIZE = 256;
/** Cache folder of the map pictures (named after their size: pictures of another size are made again). */
const MAP_PICTURE_KIND = `map-picture-${MAP_THUMBNAIL_SIZE}`;

/** Draws `image` shrunk to `size` × `size` pixels (nearest pixel) into `target` at `left`, `top`. */
function blit(image: RgbaImage, target: RgbaImage, left: number, top: number, size: number): void {
  for (let y = 0; y < size; y++) {
    const from = Math.floor(((y + 0.5) * image.height) / size) * image.width;
    for (let x = 0; x < size; x++) {
      const source = (from + Math.floor(((x + 0.5) * image.width) / size)) * 4;
      target.data.set(image.data.subarray(source, source + 4), ((top + y) * target.width + left + x) * 4);
    }
  }
}
