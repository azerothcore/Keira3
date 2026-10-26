import { inject, Service } from '@angular/core';
import { TileCoord } from './coords';
import { DbcFile, parseMapDbc, WowMap } from './dbc';
import { FolderArchive } from './folder-archive';
import { decodeBlp, parseAdt, ParsedAdt, parseWdt, RgbaImage, WdtInfo } from './formats';
import { MD5_TRANSLATE_PATH, MINIMAP_ROOT, minimapKey, parseMd5Translate } from './minimap';
import { parseConfigWtfLocale, pickLocale, sortMpqArchives } from './mpq-order';
import { LiquidMesh, parseLiquids } from './liquid';
import { buildTerrainChunkMeshes, buildTerrainMesh, TerrainChunkMesh, TerrainMeshData } from './terrain-mesh';
import { ModelPlacement, parseWmoGroup, parseWmoRoot, WmoModel, wmoGroupPath } from './wmo';
import { WowDataSettingsService } from './wow-data-settings.service';
import { StormArchive, WOW_NATIVE_API, WowNativeApi } from './wow-native-api';

/** Everything drawn for a tile in detailed mode. */
export interface TerrainDetail {
  chunks: TerrainChunkMesh[];
  liquids: LiquidMesh[];
}

type CachedAdt = ParsedAdt & { liquids: LiquidMesh[] };

const ADT_CACHE_SIZE = 32;

interface OpenClient {
  clientPath: string;
  mountpoint: string;
  /** Highest priority first. */
  archives: StormArchive[];
  archiveNames: string[];
}

/** Reads game data straight from the user's WoW 3.3.5a client (MPQ archives) and, optionally, the server's DataDir. */
@Service()
export class WowClientService {
  private readonly native = inject(WOW_NATIVE_API);
  private readonly settings = inject(WowDataSettingsService);

  private client?: Promise<OpenClient>;
  private minimapIndex?: Promise<Map<string, string>>;
  private maps?: Promise<WowMap[]>;
  private readonly wdts = new Map<string, Promise<WdtInfo | undefined>>();
  private readonly adts = new Map<string, Promise<CachedAdt | undefined>>();
  private mountCounter = 0;

  /** False in the browser build: reading local game files needs Electron. */
  isSupported(): boolean {
    return this.native !== undefined;
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
          return file.read().slice();
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

  async getMapTiles(directory: string): Promise<TileCoord[]> {
    return (await this.getWdt(directory))?.tiles ?? [];
  }

  /** Low-detail terrain of a tile: one mesh for the whole tile, textured with its minimap. */
  async getTerrain(directory: string, tile: TileCoord): Promise<TerrainMeshData | undefined> {
    const adt = await this.getAdt(directory, tile);
    return adt && buildTerrainMesh(tile, adt.chunks);
  }

  /** Textured terrain of a tile: one mesh per chunk with its texture layers, plus its liquid surfaces. */
  async getTerrainDetail(directory: string, tile: TileCoord): Promise<TerrainDetail | undefined> {
    const adt = await this.getAdt(directory, tile);
    return adt && { chunks: buildTerrainChunkMeshes(adt.chunks), liquids: adt.liquids };
  }

  /** Buildings and doodads placed by a tile. */
  async getTilePlacements(directory: string, tile: TileCoord): Promise<{ wmos: ModelPlacement[]; doodads: ModelPlacement[] } | undefined> {
    const adt = await this.getAdt(directory, tile);
    return adt && { wmos: adt.wmos, doodads: adt.doodads };
  }

  /** A building (WMO root and all its groups). */
  async getWmo(path: string): Promise<WmoModel | undefined> {
    const rootBytes = await this.readFile(path);
    if (!rootBytes) {
      return undefined;
    }
    const root = parseWmoRoot(rootBytes);
    const groups: WmoModel['groups'] = [];
    for (const [index, info] of root.groups.entries()) {
      const bytes = await this.readFile(wmoGroupPath(path, index));
      if (bytes) {
        groups.push(parseWmoGroup(bytes, root.flags, info.indoor));
      }
    }
    return { materials: root.materials, groups };
  }

  /** Decodes a BLP texture from the archives (e.g. a terrain tileset texture). */
  async getTexture(path: string): Promise<RgbaImage | undefined> {
    const blp = await this.readFile(path);
    return blp ? decodeBlp(blp) : undefined;
  }

  /** Parsed ADTs are kept for the few most recent tiles: terrain, liquids and placements share one parse. */
  private getAdt(directory: string, tile: TileCoord): Promise<CachedAdt | undefined> {
    const key = `${directory}_${tile.tx}_${tile.ty}`.toLowerCase();
    let adt = this.adts.get(key);
    if (adt) {
      // refresh its position in the LRU order
      this.adts.delete(key);
    } else {
      adt = this.loadAdt(directory, tile);
      adt.catch(() => this.adts.delete(key));
    }
    this.adts.set(key, adt);
    while (this.adts.size > ADT_CACHE_SIZE) {
      this.adts.delete(this.adts.keys().next().value as string);
    }
    return adt;
  }

  private async loadAdt(directory: string, tile: TileCoord): Promise<CachedAdt | undefined> {
    const bytes = await this.readFile(`World\\Maps\\${directory}\\${directory}_${tile.tx}_${tile.ty}.adt`);
    if (!bytes) {
      return undefined;
    }
    const parsed = parseAdt(bytes, (await this.getWdt(directory))?.layerSplatDepth ?? 4);
    return {
      ...parsed,
      liquids: parseLiquids(
        bytes,
        parsed.chunks.map((chunk) => chunk.position),
      ),
    };
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
    return blp ? decodeBlp(blp) : undefined;
  }

  /** Closes the archives; the next read reopens them (e.g. after the client path changed). */
  async close(): Promise<void> {
    const client = this.client;
    this.client = undefined;
    this.minimapIndex = undefined;
    this.maps = undefined;
    this.wdts.clear();
    this.adts.clear();
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

    const storm = native.loadStorm();
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
    return { clientPath, mountpoint, archives, archiveNames: opened };
  }

  private getMinimapIndex(): Promise<Map<string, string>> {
    this.minimapIndex ??= this.readFile(MD5_TRANSLATE_PATH).then((trs) =>
      trs ? parseMd5Translate(new TextDecoder().decode(trs)) : new Map<string, string>(),
    );
    return this.minimapIndex;
  }

  private async loadMaps(): Promise<WowMap[]> {
    const native = this.requireNative();
    const serverMapDbc = `${this.settings.paths().serverDataPath}/dbc/Map.dbc`;
    const bytes =
      this.settings.paths().serverDataPath && native.exists(serverMapDbc)
        ? native.readFile(serverMapDbc)
        : await this.readFile('DBFilesClient\\Map.dbc');
    if (!bytes) {
      throw new Error('Map.dbc not found in the client or server data.');
    }
    return parseMapDbc(new DbcFile(bytes));
  }
}
