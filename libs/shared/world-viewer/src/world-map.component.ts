import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  mmtileName,
  serverMapName,
  ServerTileCoverage,
  TILE_SIZE,
  TileCoord,
  tileKey,
  vmapTileName,
  mapKind,
  MapKind,
  WorldBounds,
  WorldPosition,
  WowClientService,
  WowMap,
} from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { imageToDataUrl, shrinkImage } from './minimap-image';

/** A dot on the world map (a spawn, a search result…). */
export interface WorldMapDot {
  key: string;
  position: WorldPosition;
  color: string;
  title?: string;
}

/** Pixels per tile, from the whole continent to a close look at one tile. */
const MIN_ZOOM = 4;
const MAX_ZOOM = 512;
/** Tile names and the grid are shown from this zoom on. */
const GRID_ZOOM = 48;
/** Minimaps are shrunk to this size (bigger only when zoomed in). */
const SMALL_IMAGE = 64;
/** Pixels a minimap is drawn with, for each quality (1-4). */
const QUALITY_SIZES = [SMALL_IMAGE, 128, 192, 256];
export const MAP_QUALITY_KEY = 'keira3.worldEditor.mapQuality';

function loadQuality(): number {
  try {
    const stored = Number(localStorage.getItem(MAP_QUALITY_KEY));
    return stored >= 1 && stored <= 4 ? Math.round(stored) : 2;
  } catch {
    return 2;
  }
}
/** At most this many dots are drawn. */
const MAX_DOTS = 3000;
/** A press moving less than this (pixels) is a click. */
const CLICK_SLOP = 4;

/** Server position → map units (tiles, from the top-left corner: x goes east, y goes south). */
const toMap = (p: { x: number; y: number }) => ({ u: 32 - p.y / TILE_SIZE, v: 32 - p.x / TILE_SIZE });
const toWorld = (u: number, v: number): WorldPosition => ({ x: (32 - v) * TILE_SIZE, y: (32 - u) * TILE_SIZE, z: 0 });

/**
 * The map seen from above, like Noggit's: the client's minimap images tile by tile, the ADT grid with each tile's
 * name and server files, where the camera is, dots (spawns, search results) and zone names. A click moves the camera
 * there; Shift + drag selects an area to load whole. The wheel zooms, dragging pans.
 */
@Component({
  selector: 'keira-world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss',
  host: { '(wheel)': 'onWheel($event)', '(document:fullscreenchange)': 'onFullscreenChange()', '[class.fullscreen]': 'fullscreen()' },
})
export class WorldMapComponent implements OnDestroy {
  private readonly client = inject(WowClientService);
  readonly directory = input<string | undefined>(undefined);
  readonly mapId = input<number | undefined>(undefined);
  readonly tiles = input<TileCoord[]>([]);
  readonly camera = input<WorldPosition | undefined>(undefined);
  readonly dots = input<WorldMapDot[]>([]);
  readonly zones = input<{ name: string; bounds: WorldBounds }[]>([]);
  /** Which server files each tile has (tinted when some are missing); undefined: not shown. */
  readonly coverage = input<Map<string, ServerTileCoverage> | undefined>(undefined);
  readonly goTo = output<WorldPosition>();
  readonly regionSelected = output<WorldBounds>();
  /** The close button. */
  readonly closed = output<void>();
  /** Every map, for the atlas of all maps. */
  readonly maps = input<WowMap[]>([]);
  /** A map without tiles (a dungeon made of one building) picked in the atlas. */
  readonly mapPicked = output<number>();
  /** A place picked on a map of the atlas. */
  readonly atlasPicked = output<{ mapId: number; position: WorldPosition }>();
  /** The atlas of every map (one big page, by kind) instead of the map shown. */
  protected readonly showAll = signal(false);
  protected readonly fullscreen = signal(false);
  /** What each map is made of, by directory: its tiles, or a single building (no tiles to draw). */
  private readonly atlasMaps = signal(new Map<string, TileCoord[] | 'building'>());
  /** Pictures of maps by directory: a data URL, or null when it has none. */
  protected readonly thumbnails = signal(new Map<string, string | null>());
  protected readonly atlasZoom = signal(8);
  protected readonly atlasOffset = signal({ x: 0, y: 0 });
  protected readonly atlasHover = signal<{ x: number; y: number; title: string } | undefined>(undefined);
  /** The atlas: a section per kind of map, each map placed on a row at its own shape (in tiles). */
  protected readonly atlas = computed(() => layoutAtlas(this.maps(), this.atlasMaps()));
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly atlasView = viewChild<ElementRef<HTMLDivElement>>('atlasView');
  private atlasRun = 0;
  private atlasPress?: { x: number; y: number; offset: { x: number; y: number }; moved: boolean };

  private readonly viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  protected readonly zoom = signal(16);
  protected readonly offset = signal({ x: 0, y: 0 });
  /** Minimap images loaded, by `tileKey@size`. */
  protected readonly images = signal(new Map<string, string>());
  protected readonly hover = signal<{ tile: TileCoord; x: number; y: number } | undefined>(undefined);
  protected readonly selection = signal<{ x: number; y: number; width: number; height: number } | undefined>(undefined);
  private press?: { x: number; y: number; offset: { x: number; y: number }; shift: boolean; moved: boolean };
  private readonly loading = new Set<string>();
  private destroyed = false;

  protected readonly showGrid = computed(() => this.zoom() >= GRID_ZOOM);
  /** How sharp the minimaps are drawn (1-4: 64 to 256 pixels a tile; sharper takes more memory), kept on this computer. */
  protected readonly quality = signal(loadQuality());
  protected readonly qualities = [1, 2, 3, 4];
  protected readonly imageSize = computed(() => {
    const size = QUALITY_SIZES[this.quality() - 1];
    // zoomed in far: the full image whatever the setting
    return this.zoom() > size * 2 ? 256 : size;
  });
  /** The tiles in view, with their image and server files. */
  protected readonly visibleTiles = computed(() => {
    const [zoom, offset] = [this.zoom(), this.offset()];
    const { width, height } = this.size();
    const size = this.imageSize();
    const images = this.images();
    const coverage = this.coverage();
    return this.tiles()
      .filter((t) => {
        const [left, top] = [offset.x + t.tx * zoom, offset.y + t.ty * zoom];
        return left + zoom > 0 && top + zoom > 0 && left < width && top < height;
      })
      .map((tile) => {
        const key = tileKey(tile);
        const files = coverage?.get(key);
        return {
          tile,
          key,
          left: tile.tx * zoom,
          top: tile.ty * zoom,
          image: images.get(`${key}@${size}`) ?? images.get(`${key}@${SMALL_IMAGE}`),
          missing: !!files && (!files.map || !files.mmap),
        };
      });
  });
  protected readonly cameraPoint = computed(() => {
    const camera = this.camera();
    if (!camera) {
      return undefined;
    }
    const { u, v } = toMap(camera);
    return { left: u * this.zoom(), top: v * this.zoom() };
  });
  protected readonly dotPoints = computed(() =>
    this.dots()
      .slice(0, MAX_DOTS)
      .map((dot) => {
        const { u, v } = toMap(dot.position);
        return { ...dot, left: u * this.zoom(), top: v * this.zoom() };
      }),
  );
  protected readonly zoneLabels = computed(() =>
    this.zones().map((zone) => {
      const { u, v } = toMap({ x: (zone.bounds.minX + zone.bounds.maxX) / 2, y: (zone.bounds.minY + zone.bounds.maxY) / 2 });
      return { name: zone.name, left: u * this.zoom(), top: v * this.zoom() };
    }),
  );
  /** What the hovered tile is called and which server files it has. */
  protected readonly hoverInfo = computed(() => {
    const hover = this.hover();
    const mapId = this.mapId();
    if (!hover) {
      return undefined;
    }
    const files = this.coverage()?.get(tileKey(hover.tile));
    const names =
      mapId === undefined
        ? []
        : [
            { name: serverMapName(mapId, hover.tile), present: files?.map },
            { name: vmapTileName(mapId, hover.tile), present: files?.vmap },
            { name: mmtileName(mapId, hover.tile), present: files?.mmap },
          ];
    return { ...hover, title: tileKey(hover.tile), names };
  });
  private readonly size = signal({ width: 0, height: 0 });

  constructor() {
    // another map: other minimaps
    effect(() => {
      this.directory();
      untracked(() => this.images.set(new Map()));
    });
    // fit the map in the view when it changes
    effect(() => {
      const tiles = this.tiles();
      untracked(() => this.fit(tiles));
    });
    effect(() => {
      const visible = this.visibleTiles();
      const size = this.imageSize();
      const directory = this.directory();
      untracked(() => directory && visible.forEach(({ tile, key }) => void this.loadImage(directory, tile, `${key}@${size}`, size)));
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.atlasRun++;
  }

  protected setQuality(quality: number): void {
    this.quality.set(quality);
    try {
      localStorage.setItem(MAP_QUALITY_KEY, String(quality));
    } catch {
      // (not kept)
    }
  }

  /** Shows the atlas of every map, reading what each is made of then drawing their pictures (or goes back to the map). */
  protected toggleAll(): void {
    const show = !this.showAll();
    this.showAll.set(show);
    const run = ++this.atlasRun;
    if (show) {
      void this.loadAtlas(run);
    }
  }

  protected async toggleFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await this.host.nativeElement.requestFullscreen();
    }
  }

  protected onFullscreenChange(): void {
    this.fullscreen.set(document.fullscreenElement === this.host.nativeElement);
  }

  protected onAtlasPointerDown(event: PointerEvent): void {
    if (event.button === 0) {
      const { x, y } = this.atlasPointer(event);
      this.atlasPress = { x, y, offset: this.atlasOffset(), moved: false };
    }
  }

  protected onAtlasPointerMove(event: PointerEvent): void {
    const { x, y } = this.atlasPointer(event);
    const spot = this.atlasSpot(x, y);
    this.atlasHover.set(
      spot && {
        x,
        y,
        title: `${spot.block.map.id} – ${spot.block.map.name}${spot.tile ? ` · ${tileKey(spot.tile)}` : ''}`,
      },
    );
    const press = this.atlasPress;
    if (press) {
      press.moved ||= Math.hypot(x - press.x, y - press.y) > CLICK_SLOP;
      if (press.moved) {
        this.atlasOffset.set({ x: press.offset.x + x - press.x, y: press.offset.y + y - press.y });
      }
    }
  }

  /** A click on a map of the atlas: there on that map (a dungeon: the dungeon). */
  protected onAtlasPointerUp(event: PointerEvent): void {
    const press = this.atlasPress;
    this.atlasPress = undefined;
    if (!press || press.moved) {
      return;
    }
    const { x, y } = this.atlasPointer(event);
    const spot = this.atlasSpot(x, y);
    if (!spot || (spot.block.tiles.length && !spot.tile)) {
      return;
    }
    this.showAll.set(false);
    this.atlasRun++;
    if (spot.tile) {
      this.atlasPicked.emit({ mapId: spot.block.map.id, position: toWorld(spot.u, spot.v) });
    } else {
      this.mapPicked.emit(spot.block.map.id);
    }
  }

  protected onAtlasPointerLeave(): void {
    this.atlasHover.set(undefined);
    this.atlasPress = undefined;
  }

  /** The map of the atlas under a point of the view, with the tile (and map units) there when it has one. */
  private atlasSpot(x: number, y: number): { block: AtlasBlock; tile?: TileCoord; u: number; v: number } | undefined {
    const zoom = this.atlasZoom();
    const offset = this.atlasOffset();
    const [px, py] = [(x - offset.x) / zoom, (y - offset.y) / zoom];
    const block = this.atlas().blocks.find((b) => px >= b.x && px < b.x + b.width && py >= b.y && py < b.y + b.height);
    if (!block) {
      return undefined;
    }
    const [u, v] = [block.minTx + px - block.x, block.minTy + py - block.y];
    const tile = block.tiles.find((t) => t.tx === Math.floor(u) && t.ty === Math.floor(v));
    return { block, tile, u, v };
  }

  private atlasPointer(event: MouseEvent): { x: number; y: number } {
    const rect = (this.atlasView() as ElementRef<HTMLDivElement>).nativeElement.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  /** What each map is made of (one after the other), then fits the atlas in the view and draws the pictures. */
  private async loadAtlas(run: number): Promise<void> {
    for (const map of this.maps()) {
      if (run !== this.atlasRun) {
        return;
      }
      if (this.atlasMaps().has(map.directory)) {
        continue;
      }
      const tiles = await this.client.getMapTiles(map.directory).catch((): TileCoord[] => []);
      // a single tile may be a dungeon's one building (no minimaps to draw)
      const building = tiles.length === 1 && (await this.client.getMapBuilding(map.directory).catch(() => undefined));
      this.atlasMaps.update((maps) => new Map(maps).set(map.directory, building ? 'building' : tiles));
    }
    // (the atlas fills the component)
    const { width } = this.host.nativeElement.getBoundingClientRect();
    this.atlasZoom.set(Math.max(1, (width - 16) / Math.max(1, this.atlas().width)));
    this.atlasOffset.set({ x: 8, y: 48 });
    for (const block of this.atlas().blocks) {
      if (run !== this.atlasRun) {
        return;
      }
      if (block.tiles.length === 0 || this.thumbnails().has(block.map.directory)) {
        continue;
      }
      const image = await this.client.getMapThumbnail(block.map.directory).catch(() => undefined);
      this.thumbnails.update((thumbnails) => new Map(thumbnails).set(block.map.directory, image ? imageToDataUrl(image) : null));
    }
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const atlas = this.showAll();
    const { x, y } = atlas ? this.atlasPointer(event) : this.pointer(event);
    const [zoomSignal, offsetSignal] = atlas ? [this.atlasZoom, this.atlasOffset] : [this.zoom, this.offset];
    const before = zoomSignal();
    const zoom = Math.min(MAX_ZOOM, Math.max(atlas ? 1 : MIN_ZOOM, before * (event.deltaY < 0 ? 1.25 : 0.8)));
    const offset = offsetSignal();
    // keep the point under the cursor where it is
    offsetSignal.set({ x: x - ((x - offset.x) / before) * zoom, y: y - ((y - offset.y) / before) * zoom });
    zoomSignal.set(zoom);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    const { x, y } = this.pointer(event);
    this.press = { x, y, offset: this.offset(), shift: event.shiftKey, moved: false };
  }

  protected onPointerMove(event: PointerEvent): void {
    const { x, y } = this.pointer(event);
    const tile = this.tileAt(x, y);
    this.hover.set(tile ? { tile, x, y } : undefined);
    const press = this.press;
    if (!press) {
      return;
    }
    press.moved ||= Math.hypot(x - press.x, y - press.y) > CLICK_SLOP;
    if (!press.moved) {
      return;
    }
    if (press.shift) {
      this.selection.set({ x: Math.min(x, press.x), y: Math.min(y, press.y), width: Math.abs(x - press.x), height: Math.abs(y - press.y) });
    } else {
      this.offset.set({ x: press.offset.x + x - press.x, y: press.offset.y + y - press.y });
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const press = this.press;
    this.press = undefined;
    if (!press) {
      return;
    }
    const { x, y } = this.pointer(event);
    const at = (px: number, py: number) => this.worldAt(px, py);
    if (!press.moved) {
      // only where the map has a tile (not the empty space around it)
      if (this.tileAt(x, y)) {
        this.goTo.emit(at(x, y));
      }
    } else if (press.shift) {
      this.selection.set(undefined);
      const [a, b] = [at(press.x, press.y), at(x, y)];
      this.regionSelected.emit({ minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x), minY: Math.min(a.y, b.y), maxY: Math.max(a.y, b.y) });
    }
  }

  protected onPointerLeave(): void {
    this.hover.set(undefined);
  }

  /** Zooms on the camera (or out to the whole map). */
  protected centerOnCamera(): void {
    const point = this.cameraPoint();
    if (!point) {
      return;
    }
    const { width, height } = this.measure();
    this.offset.set({ x: width / 2 - point.left, y: height / 2 - point.top });
  }

  protected fitAll(): void {
    this.fit(this.tiles());
  }

  /** The map's tile under a point of the view, if it has one there. */
  private tileAt(x: number, y: number): TileCoord | undefined {
    const zoom = this.zoom();
    const offset = this.offset();
    const tile = { tx: Math.floor((x - offset.x) / zoom), ty: Math.floor((y - offset.y) / zoom) };
    return this.tiles().some((t) => t.tx === tile.tx && t.ty === tile.ty) ? tile : undefined;
  }

  private worldAt(x: number, y: number): WorldPosition {
    const zoom = this.zoom();
    const offset = this.offset();
    return toWorld((x - offset.x) / zoom, (y - offset.y) / zoom);
  }

  private fit(tiles: TileCoord[]): void {
    const { width, height } = this.measure();
    if (tiles.length === 0) {
      return;
    }
    const [minX, maxX] = [Math.min(...tiles.map((t) => t.tx)), Math.max(...tiles.map((t) => t.tx)) + 1];
    const [minY, maxY] = [Math.min(...tiles.map((t) => t.ty)), Math.max(...tiles.map((t) => t.ty)) + 1];
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(width / (maxX - minX), height / (maxY - minY))));
    this.zoom.set(zoom);
    this.offset.set({ x: (width - (maxX + minX) * zoom) / 2, y: (height - (maxY + minY) * zoom) / 2 });
  }

  private measure(): { width: number; height: number } {
    const rect = this.viewport().nativeElement.getBoundingClientRect();
    const size = { width: rect.width, height: rect.height };
    this.size.set(size);
    return size;
  }

  private pointer(event: MouseEvent): { x: number; y: number } {
    const rect = this.viewport().nativeElement.getBoundingClientRect();
    this.size.set({ width: rect.width, height: rect.height });
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private async loadImage(directory: string, tile: TileCoord, key: string, size: number): Promise<void> {
    if (this.images().has(key) || this.loading.has(key)) {
      return;
    }
    this.loading.add(key);
    try {
      const image = await this.client.getMinimap(directory, tile);
      if (image && !this.destroyed) {
        const url = imageToDataUrl(size >= image.width ? image : shrinkImage(image, size));
        this.images.update((images) => new Map(images).set(key, url));
      }
    } catch {
      // no minimap there: the tile stays plain
    } finally {
      this.loading.delete(key);
    }
  }
}

/** A map placed in the atlas (in tiles): where, its size, and its tiles (none for a dungeon of one building). */
export interface AtlasBlock {
  map: WowMap;
  x: number;
  y: number;
  width: number;
  height: number;
  minTx: number;
  minTy: number;
  tiles: TileCoord[];
}

/** The sections of the atlas, in order. */
const ATLAS_SECTIONS: MapKind[] = ['world', 'dungeon', 'raid', 'battleground', 'arena', 'transport'];
/** Width (tiles) of the atlas page: an open world map is up to 64 tiles across. */
const ATLAS_WIDTH = 160;
/** Room (tiles) for a section's title, between maps, and the size of a dungeon of one building. */
const ATLAS_TITLE = 6;
const ATLAS_GAP = 2;
const ATLAS_BUILDING = 8;

/**
 * Lays out every map known so far on one page: a section per kind (Maps, Dungeons, Raids…), and in each the maps on
 * rows, left to right, each at its own shape (its tiles' extent); dungeons of one building get a square.
 */
export function layoutAtlas(
  maps: WowMap[],
  contents: Map<string, TileCoord[] | 'building'>,
): { width: number; height: number; sections: { kind: MapKind; y: number }[]; blocks: AtlasBlock[] } {
  const sections: { kind: MapKind; y: number }[] = [];
  const blocks: AtlasBlock[] = [];
  let y = 0;
  for (const kind of ATLAS_SECTIONS) {
    const members = maps.filter((map) => mapKind(map) === kind && contents.has(map.directory));
    const placeable = members.filter(
      (map) => contents.get(map.directory) === 'building' || (contents.get(map.directory) as TileCoord[]).length,
    );
    if (placeable.length === 0) {
      continue;
    }
    sections.push({ kind, y });
    y += ATLAS_TITLE;
    let [x, rowHeight] = [0, 0];
    for (const map of placeable) {
      const content = contents.get(map.directory) as TileCoord[] | 'building';
      const tiles = content === 'building' ? [] : content;
      const minTx = tiles.length ? Math.min(...tiles.map((t) => t.tx)) : 0;
      const minTy = tiles.length ? Math.min(...tiles.map((t) => t.ty)) : 0;
      const width = tiles.length ? Math.max(...tiles.map((t) => t.tx)) - minTx + 1 : ATLAS_BUILDING;
      const height = tiles.length ? Math.max(...tiles.map((t) => t.ty)) - minTy + 1 : ATLAS_BUILDING;
      if (x > 0 && x + width > ATLAS_WIDTH) {
        [x, y, rowHeight] = [0, y + rowHeight + ATLAS_GAP, 0];
      }
      blocks.push({ map, x, y, width, height, minTx, minTy, tiles });
      x += width + ATLAS_GAP;
      rowHeight = Math.max(rowHeight, height);
    }
    y += rowHeight + ATLAS_GAP * 2;
  }
  return { width: ATLAS_WIDTH, height: y, sections, blocks };
}
