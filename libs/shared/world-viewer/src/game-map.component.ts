import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import {
  AREA_CAPITAL,
  AREA_SANCTUARY,
  firstPage,
  fromGameMap,
  GameMapData,
  GameZone,
  GameMapOverlay,
  GameMapPoint,
  GameMapRegion,
  GamePage,
  gameMapPages,
  GAME_MAP_HEIGHT,
  GAME_MAP_WIDTH,
  glowAt,
  glowImage,
  onGameMap,
  pageAt,
  pageFloors,
  RgbaImage,
  toGameMap,
  WorldBounds,
  WorldPosition,
  WowClientService,
  WowMap,
} from '@keira/shared/wow-data';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GAME_MAP_POI_KINDS, GameMapPoi, GameMapPoiKind, loadShownPois, saveShownPois } from './game-map-pois';
import { imageToDataUrl, imageToPngUrl } from './minimap-image';
import { WorldMapDot } from './world-map.component';

/** The colour of the glow under the pointer (the game's yellow). */
const GLOW_COLOR: [number, number, number] = [255, 214, 64];
/** A glow weaker than this is not the zone under the pointer. */
const GLOW_MIN = 0.12;
/** At most this many spawn dots are drawn. */
const MAX_DOTS = 3000;

/** A pin on the picture, in fractions of it. */
interface GamePin {
  key: string;
  u: number;
  v: number;
  title: string;
  color?: string;
  icon?: string;
  fa?: string;
  position: WorldPosition;
}

/** A glow, as drawn and as read to find which one the pointer is on. */
interface Glow {
  url: string;
  image: RgbaImage;
}

/**
 * The in-game world map, made from the client's own pictures and DBCs: from the cosmic map down to the world map, its
 * continents, their zones and the floors of instances. A zone glows (and says its levels and whose land it is) under
 * the pointer and a click opens it; on a zone, sub-zones are named and a click moves the camera there. Spawns loaded
 * (with the view's filters) and points of interest (flight masters, inns…, each kind on or off) are pinned.
 */
@Component({
  selector: 'keira-game-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './game-map.component.html',
  styleUrl: './game-map.component.scss',
})
export class GameMapComponent {
  private readonly client = inject(WowClientService);
  private readonly translate = inject(TranslateService);

  /** The map the camera is on, and where. */
  readonly mapId = input<number | undefined>(undefined);
  readonly camera = input<WorldPosition | undefined>(undefined);
  /** The zone the camera is in (AreaTable id), to open the right page where zones overlap. */
  readonly zoneId = input(0);
  readonly dots = input<WorldMapDot[]>([]);
  readonly pois = input<GameMapPoi[]>([]);
  readonly maps = input<WowMap[]>([]);
  /** Go to a place (of any map). */
  readonly goTo = output<{ mapId: number; position: WorldPosition }>();
  /** Load every spawn of an area (the zone shown). */
  readonly regionSelected = output<WorldBounds>();

  protected readonly data = signal<GameMapData | undefined>(undefined);
  protected readonly failed = signal(false);
  protected readonly pages = computed(() => {
    const data = this.data();
    return data ? gameMapPages(data) : new Map<string, GamePage>();
  });
  protected readonly pageKey = signal<string | undefined>(undefined);
  protected readonly page = computed(() => {
    const key = this.pageKey();
    return key ? this.pages().get(key) : undefined;
  });
  /** The pictures of the pages, by prefix (null: the client has none). */
  protected readonly pictures = signal(new Map<string, string | null>());
  /** The glows of the regions, by path (null: none). */
  private readonly glows = signal(new Map<string, Glow | null>());
  protected readonly hover = signal<{ point: GameMapPoint; x: number; y: number } | undefined>(undefined);
  protected readonly shownPois = signal(loadShownPois());
  protected readonly showFilters = signal(false);
  protected readonly poiKinds = GAME_MAP_POI_KINDS;
  protected readonly width = GAME_MAP_WIDTH;
  protected readonly height = GAME_MAP_HEIGHT;

  protected readonly floors = computed(() => {
    const page = this.page();
    const floors = page ? pageFloors(this.pages(), page) : [];
    return floors.length > 1 ? floors : [];
  });

  /** The overlays of the zone shown, to name sub-zones. */
  private readonly overlays = computed(() => {
    const page = this.page();
    return page?.kind === 'zone' ? (this.data() as GameMapData).overlays.filter((o) => o.mapAreaId === page.mapAreaId) : [];
  });

  /** The region (a zone, a continent) under the pointer: the one glowing most there. */
  protected readonly hoverRegion = computed<GameMapRegion | undefined>(() => {
    const hover = this.hover();
    const page = this.page();
    if (!hover || !page) {
      return undefined;
    }
    const { u, v } = hover.point;
    let best: { region: GameMapRegion; strength: number } | undefined;
    for (const region of page.regions) {
      const { left, top, right, bottom } = region.rect;
      if (u < left || u > right || v < top || v > bottom) {
        continue;
      }
      const [ru, rv] = [(u - left) / (right - left), (v - top) / (bottom - top)];
      const glow = region.highlight ? this.glows().get(region.highlight) : undefined;
      const strength = region.circle ? (Math.hypot(ru - 0.5, rv - 0.5) <= 0.5 ? 1 : 0) : glow ? glowAt(glow.image, ru, rv) : 0;
      if (strength >= GLOW_MIN && (!best || strength > best.strength)) {
        best = { region, strength };
      }
    }
    return best?.region;
  });

  /** The glow drawn for the region under the pointer. */
  protected readonly hoverGlow = computed(() => {
    const region = this.hoverRegion();
    const glow = region?.highlight ? this.glows().get(region.highlight) : undefined;
    return region && glow ? { rect: region.rect, url: glow.url } : undefined;
  });

  /** The sub-zone under the pointer on a zone (the smallest that names it there). */
  private readonly hoverOverlay = computed<GameMapOverlay | undefined>(() => {
    // (asked only while the pointer is on the picture)
    const hover = this.hover() as { point: GameMapPoint };
    const [x, y] = [hover.point.u * GAME_MAP_WIDTH, hover.point.v * GAME_MAP_HEIGHT];
    return this.overlays()
      .filter(({ hit }) => x >= hit.left && x <= hit.right && y >= hit.top && y <= hit.bottom)
      .sort((a, b) => (a.hit.right - a.hit.left) * (a.hit.bottom - a.hit.top) - (b.hit.right - b.hit.left) * (b.hit.bottom - b.hit.top))[0];
  });

  /** What the tooltip says: the region's name, levels and land; or the sub-zone and the coordinates (as in the game). */
  protected readonly tooltip = computed(() => {
    const hover = this.hover();
    const page = this.page();
    if (!hover || !page) {
      return undefined;
    }
    const region = this.hoverRegion();
    if (region) {
      const target = firstPage(this.pages(), region.page);
      const zone = target && this.data()?.zones.get(target.areaId);
      return { x: hover.x, y: hover.y, title: target ? this.pageName(target) : '', lines: zone ? this.zoneLines(zone) : [] };
    }
    if (!page.bounds || page.kind === 'continent') {
      return undefined;
    }
    const overlay = this.hoverOverlay();
    const area = overlay ? this.areaName(overlay.areaIds[0]) : '';
    const coords = `${(hover.point.u * 100).toFixed(1)}, ${(hover.point.v * 100).toFixed(1)}`;
    return { x: hover.x, y: hover.y, title: area || this.areaName(page.areaId), lines: [coords] };
  });

  /** The pins of the page: spawns and points of interest on its picture. */
  protected readonly pins = computed<GamePin[]>(() => {
    const page = this.page();
    if (!page?.bounds) {
      return [];
    }
    const pins: GamePin[] = [];
    if (page.mapId === this.mapId()) {
      for (const dot of this.dots()) {
        const point = this.placeOn(page, page.mapId, dot.position);
        if (point && pins.length < MAX_DOTS) {
          pins.push({ key: dot.key, ...point, title: dot.title ?? '', color: dot.color, position: dot.position });
        }
      }
    }
    const shown = this.shownPois();
    const kinds = new Map(GAME_MAP_POI_KINDS.map((k) => [k.kind, k]));
    this.pois().forEach((poi, i) => {
      const point = shown.has(poi.kind) ? this.placeOn(page, poi.mapId, poi) : undefined;
      if (point) {
        const kind = kinds.get(poi.kind) as (typeof GAME_MAP_POI_KINDS)[number];
        const title = [poi.name, poi.subname && `<${poi.subname}>`, this.translate.instant(kind.label)].filter(Boolean).join(' ');
        pins.push({ key: `poi:${i}`, ...point, title, icon: kind.icon && this.icons().get(kind.icon), fa: kind.fa, position: poi });
      }
    });
    return pins;
  });

  /** The icons of the kinds of points of interest, as pictures. */
  protected readonly icons = signal(new Map<string, string>());

  protected readonly cameraPin = computed(() => {
    const page = this.page();
    const camera = this.camera();
    const mapId = this.mapId();
    return page?.bounds && camera && mapId !== undefined ? this.placeOn(page, mapId, camera) : undefined;
  });

  /** Whether the zone shown is on the map the camera is on (its spawns can be loaded). */
  protected readonly canLoadZone = computed(() => {
    const page = this.page();
    return !!page?.bounds && page.kind !== 'continent' && page.mapId === this.mapId();
  });

  constructor() {
    void this.client
      .getGameMap()
      .then((data) => this.data.set(data))
      .catch((error: Error) => {
        console.warn('[World Editor] Could not read the world map:', error);
        this.failed.set(true);
      });
    // open where the camera is
    effect(() => {
      if (this.pages().size && !untracked(this.pageKey)) {
        untracked(() => this.showCamera());
      }
    });
    // the page's picture and glows
    effect(() => {
      const page = this.page();
      const overlays = this.overlays();
      untracked(() => page && this.load(page, overlays));
    });
    // the icons of the points of interest, once the client is read
    effect(() => {
      if (this.data()) {
        untracked(() => GAME_MAP_POI_KINDS.forEach((k) => k.icon && void this.loadIcon(k.icon)));
      }
    });
  }

  /** Opens the page where the camera is. */
  protected showCamera(): void {
    const camera = this.camera();
    const mapId = this.mapId();
    const pages = this.pages();
    if (camera && mapId !== undefined) {
      this.pageKey.set(pageAt(pages, mapId, camera.x, camera.y, this.zoneId()).key);
    } else {
      this.pageKey.set('world');
    }
  }

  protected open(key: string): void {
    const page = firstPage(this.pages(), key);
    if (page) {
      this.pageKey.set(page.key);
      this.hover.set(undefined);
    }
  }

  /** The page "back" goes to. */
  protected readonly parentPage = computed(() => {
    const parent = this.page()?.parent;
    return parent ? this.pages().get(parent) : undefined;
  });

  protected pageName(page: GamePage): string {
    switch (page.kind) {
      case 'cosmic':
        return this.translate.instant('WORLD_EDITOR.GAME_MAP_COSMIC');
      case 'world':
        return this.translate.instant('WORLD_EDITOR.GAME_MAP_AZEROTH');
      case 'continent':
        return this.maps().find((m) => m.id === page.mapId)?.name ?? '';
      default: {
        const name = this.areaName(page.areaId) || page.prefix.slice(0, page.prefix.indexOf('\\'));
        return page.floor === undefined
          ? name
          : `${name} – ${this.translate.instant('WORLD_EDITOR.GAME_MAP_FLOOR', { floor: page.floor })}`;
      }
    }
  }

  protected floorName(page: GamePage): string {
    return page.floor === undefined ? this.translate.instant('WORLD_EDITOR.GAME_MAP_OUTSIDE') : String(page.floor);
  }

  private areaName(areaId: number): string {
    return this.data()?.zones.get(areaId)?.name ?? '';
  }

  /** A zone's levels and whose land it is. */
  private zoneLines(zone: GameZone): string[] {
    const lines: string[] = [];
    if (zone.flags & AREA_CAPITAL) {
      lines.push(this.translate.instant('WORLD_EDITOR.GAME_MAP_CITY'));
    } else if (zone.levels) {
      const [min, max] = zone.levels;
      lines.push(this.translate.instant('WORLD_EDITOR.GAME_MAP_LEVELS', { min, max }));
    }
    const land =
      zone.flags & AREA_SANCTUARY
        ? 'SANCTUARY'
        : zone.faction === 1
          ? 'ALLIANCE'
          : zone.faction === 0
            ? 'HORDE'
            : zone.faction === -1
              ? 'CONTESTED'
              : undefined;
    if (land) {
      lines.push(this.translate.instant(`WORLD_EDITOR.GAME_MAP_${land}`));
    }
    return lines;
  }

  /** Where a place of a map is on a page: its own map, or (a continent) a map drawn on it, like Eversong Woods. */
  private placeOn(page: GamePage, mapId: number, place: { x: number; y: number }): { u: number; v: number } | undefined {
    let [x, y] = [place.x, place.y];
    if (mapId !== page.mapId) {
      const move =
        page.kind === 'continent'
          ? this.data()?.transforms.find(
              (t) =>
                t.mapId === mapId &&
                t.newMapId === page.mapId &&
                x >= t.region.minX &&
                x <= t.region.maxX &&
                y >= t.region.minY &&
                y <= t.region.maxY,
            )
          : undefined;
      if (!move) {
        return undefined;
      }
      [x, y] = [x + move.offsetX, y + move.offsetY];
    }
    const point = toGameMap(page.bounds as WorldBounds, x, y);
    return onGameMap(point) ? point : undefined;
  }

  protected onPointerMove(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    const box = target.getBoundingClientRect();
    if (!box.width || !box.height) {
      return;
    }
    const point = { u: (event.clientX - box.left) / box.width, v: (event.clientY - box.top) / box.height };
    this.hover.set({ point, x: event.clientX - box.left, y: event.clientY - box.top });
  }

  protected onPointerLeave(): void {
    this.hover.set(undefined);
  }

  /** A click opens the zone under the pointer, or (on a zone) moves the camera there. */
  protected onClick(): void {
    const region = this.hoverRegion();
    if (region) {
      this.open(region.page);
      return;
    }
    const page = this.page();
    const hover = this.hover();
    if (page?.bounds && page.kind !== 'continent' && hover) {
      const { x, y } = fromGameMap(page.bounds, hover.point);
      this.goTo.emit({ mapId: page.mapId, position: { x, y, z: page.mapId === this.mapId() ? (this.camera()?.z ?? 0) : 0 } });
    }
  }

  protected goToPin(pin: GamePin, event: Event): void {
    event.stopPropagation();
    this.goTo.emit({ mapId: (this.page() as GamePage).mapId, position: pin.position });
  }

  protected loadZone(): void {
    this.regionSelected.emit((this.page() as GamePage).bounds as WorldBounds);
  }

  protected togglePoi(kind: GameMapPoiKind): void {
    const kinds = new Set(this.shownPois());
    if (!kinds.delete(kind)) {
      kinds.add(kind);
    }
    this.shownPois.set(kinds);
    saveShownPois(kinds);
  }

  protected setAllPois(on: boolean): void {
    const kinds = new Set<GameMapPoiKind>(on ? GAME_MAP_POI_KINDS.map((k) => k.kind) : []);
    this.shownPois.set(kinds);
    saveShownPois(kinds);
  }

  private async load(page: GamePage, overlays: GameMapOverlay[]): Promise<void> {
    if (!this.pictures().has(page.prefix)) {
      this.pictures.update((map) => new Map(map).set(page.prefix, null));
      const picture = await this.client.getGameMapPicture(page, overlays).catch((error: Error) => {
        console.warn(`[World Editor] Could not draw the world map ${page.prefix}:`, error);
        return undefined;
      });
      this.pictures.update((map) => new Map(map).set(page.prefix, picture ? imageToDataUrl(picture) : null));
    }
    for (const region of page.regions) {
      const path = region.highlight;
      if (path && !this.glows().has(path)) {
        this.glows.update((map) => new Map(map).set(path, null));
        const highlight = await this.client.getTexture(path).catch(() => undefined);
        const image = highlight && glowImage(highlight, GLOW_COLOR);
        this.glows.update((map) => new Map(map).set(path, image ? { url: imageToPngUrl(image), image } : null));
      }
    }
  }

  private async loadIcon(path: string): Promise<void> {
    this.icons.update((map) => new Map(map).set(path, ''));
    const image = await this.client.getTexture(path).catch(() => undefined);
    this.icons.update((map) => new Map(map).set(path, image ? imageToPngUrl(image) : ''));
  }
}
