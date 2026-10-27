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
  WorldBounds,
  WorldPosition,
  WowClientService,
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
  host: { '(wheel)': 'onWheel($event)' },
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
  protected readonly imageSize = computed(() => (this.zoom() > SMALL_IMAGE * 2 ? 256 : SMALL_IMAGE));
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
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const { x, y } = this.pointer(event);
    const before = this.zoom();
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, before * (event.deltaY < 0 ? 1.25 : 0.8)));
    const offset = this.offset();
    // keep the point under the cursor where it is
    this.offset.set({ x: x - ((x - offset.x) / before) * zoom, y: y - ((y - offset.y) / before) * zoom });
    this.zoom.set(zoom);
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
    const zoom = this.zoom();
    const offset = this.offset();
    const [u, v] = [(x - offset.x) / zoom, (y - offset.y) / zoom];
    const tile = { tx: Math.floor(u), ty: Math.floor(v) };
    const known = this.tiles().some((t) => t.tx === tile.tx && t.ty === tile.ty);
    this.hover.set(known ? { tile, x, y } : undefined);
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
      this.goTo.emit(at(x, y));
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
