import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import {
  AREA_CAPITAL,
  AREA_SANCTUARY,
  AreaTriggerInfo,
  FactionData,
  firstPage,
  fromGameMap,
  GameMapData,
  GameMapOverlay,
  GameMapPicture,
  GameMapPoint,
  GameMapShapes,
  GamePage,
  gameMapPages,
  GameZone,
  labelAt,
  onContinent,
  onGameMap,
  pageAt,
  pageChildren,
  pageFloors,
  perfNote,
  regionShapes,
  RgbaImage,
  shapeCentres,
  shapeEdges,
  SHAPE_HEIGHT,
  SHAPE_WIDTH,
  ShapeSource,
  TaxiPath,
  toGameMap,
  WorldBounds,
  WorldPosition,
  WowClientService,
  WowMap,
} from '@keira/shared/wow-data';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { levelColor, paintHover, paintShapes, territoryColor, LEVEL_BANDS, cssRgb } from './game-map-layers';
import {
  factionSide,
  GAME_MAP_LAYER_GROUPS,
  GAME_MAP_LAYERS,
  GameMapLayer,
  GameMapLayerGroup,
  GameMapPoi,
  GameMapTeleport,
  GameMapTransport,
  loadMarkerSize,
  loadShownLayers,
  MARKER_SIZES,
  saveMarkerSize,
  saveShownLayers,
  transportKind,
} from './game-map-pois';
import { imageToDataUrl, imageToPngUrl } from './minimap-image';
import { WorldMapDot } from './world-map.component';

/** At most this many spawn dots are drawn. */
const MAX_DOTS = 3000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
/** A press moving less than this (pixels) is a click. */
const CLICK_SLOP = 4;
/** A double click this soon after a click opened a page belongs to that click. */
const DOUBLE_CLICK_AFTER_OPEN = 600;
/** Zones smaller than this (grid pixels) aren't named on the map. */
const NAME_MIN_PIXELS = 150;
/** Instance types (Map.dbc) of dungeons and raids. */
const INSTANCE_DUNGEON = 1;
const INSTANCE_RAID = 2;
/** A transport's line, by side. */
const ROUTE_COLORS = { alliance: '#4d8dff', horde: '#ff4d4d', neutral: '#ffd200' };

/** The side badges drawn on markers serving one side. */
const SIDE_BADGES = {
  alliance: 'Interface\\TargetingFrame\\UI-PVP-Alliance.blp',
  horde: 'Interface\\TargetingFrame\\UI-PVP-Horde.blp',
};

/** A marker on the picture, in fractions of it. */
interface GamePin {
  key: string;
  u: number;
  v: number;
  title: string;
  lines: string[];
  color?: string;
  icon?: string;
  fa?: string;
  side?: 'alliance' | 'horde';
  /** An instance's entrance opens its map. */
  opens?: string;
  position: WorldPosition;
  mapId: number;
}

/** A transport's route on the picture. */
interface GameRoute {
  key: string;
  name: string;
  color: string;
  /** Its runs on the picture, as SVG points (0..1000). */
  lines: string[];
}

/** Text drawn on the picture: a zone's name. */
interface GameLabel {
  key: string;
  u: number;
  v: number;
  text: string;
  page: string;
}

/**
 * The in-game world map, made at run time from the user's own client (pictures and DBCs; nothing of the client ships
 * with Keira): the cosmic map, the world map, the continents, their zones and the floors of instances, like AoWoW's.
 * Zones have their exact shapes (from the client's highlights) with borders, level or faction colours and names; the
 * zone under the pointer lights up and a click opens it, on a zone too (its neighbours). Sub-zones are named with the
 * game's coordinates. The wheel zooms and dragging pans. Markers (townsfolk, professions, vendors, transports, instance
 * entrances, and the 3D view's spawns when asked) come in groups, each on or off. A double click moves the camera there;
 * Ctrl + click copies a `.go` command.
 */
@Component({
  selector: 'keira-game-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './game-map.component.html',
  styleUrl: './game-map.component.scss',
  host: { '[style.--marker.px]': 'markerSize()' },
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
  readonly transports = input<GameMapTransport[]>([]);
  readonly teleports = input<GameMapTeleport[]>([]);
  readonly maps = input<WowMap[]>([]);
  /** Go to a place (of any map). */
  readonly goTo = output<{ mapId: number; position: WorldPosition }>();
  /** Load every spawn of an area (the zone shown). */
  readonly regionSelected = output<WorldBounds>();
  readonly closed = output<void>();

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
  /** The pictures of the pages, by prefix: 'loading', the picture, or null (the client has none). */
  private readonly pictures = signal(new Map<string, { url: string; picture: GameMapPicture } | null | 'loading'>());
  protected readonly picture = computed(() => {
    const page = this.page();
    return page ? this.pictures().get(page.prefix) : undefined;
  });
  /** The shapes of the regions of pages with regions (continents, world, cosmic), by page key. */
  private readonly shapes = signal(new Map<string, GameMapShapes>());
  /** The highlights of the regions, by path (null: none). */
  private readonly highlights = signal(new Map<string, RgbaImage | null>());
  protected readonly shown = signal(loadShownLayers());
  protected readonly markerSize = signal(loadMarkerSize());
  protected readonly markerSizes = MARKER_SIZES;
  protected readonly showPanel = signal(true);
  protected readonly groups = GAME_MAP_LAYER_GROUPS;
  protected readonly levelBands = LEVEL_BANDS.map(([from, color], i) => ({
    text: `${from}${LEVEL_BANDS[i + 1] ? `–${LEVEL_BANDS[i + 1][0] - 1}` : '+'}`,
    color: cssRgb(color),
  }));
  protected readonly zoom = signal(1);
  protected readonly pan = signal({ x: 0, y: 0 });
  protected readonly hover = signal<{ point: GameMapPoint; x: number; y: number } | undefined>(undefined);
  protected readonly hoverPin = signal<{ pin: GamePin; x: number; y: number } | undefined>(undefined);
  protected readonly copied = signal<string | undefined>(undefined);
  /** The icons of the layers (and the side badges), as pictures, by path. */
  protected readonly icons = signal(new Map<string, string>());
  private readonly factions = signal<FactionData | undefined>(undefined);
  private readonly triggers = signal(new Map<number, AreaTriggerInfo[]>());
  private readonly taxiPaths = signal(new Map<number, TaxiPath[]>());
  private press?: { x: number; y: number; pan: { x: number; y: number }; moved: boolean };
  private openedAt = 0;

  protected readonly floors = computed(() => {
    const page = this.page();
    const floors = page ? pageFloors(this.pages(), page) : [];
    return floors.length > 1 ? floors : [];
  });

  /** The maps reached from the page shown (caves, mines, instances), by name. */
  protected readonly children = computed(() => {
    const page = this.page();
    return (page ? pageChildren(this.pages(), page) : [])
      .map((child) => ({ key: child.key, name: this.pageName({ ...child, floor: undefined }) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  /** The page "back" goes to. */
  protected readonly parentPage = computed(() => {
    const parent = this.page()?.parent;
    return parent ? this.pages().get(parent) : undefined;
  });

  /** The overlays of the zone shown (its sub-zones). */
  private readonly overlays = computed(() => {
    const page = this.page();
    return page?.kind === 'zone' ? (this.data() as GameMapData).overlays.filter((o) => o.mapAreaId === page.mapAreaId) : [];
  });

  /** The continent a zone is drawn on, to find its neighbours there. */
  private readonly continent = computed(() => {
    const page = this.page();
    if (!page?.bounds || page.kind !== 'zone') {
      return undefined;
    }
    const placed = onContinent({ mapId: page.mapId, bounds: page.bounds }, (this.data() as GameMapData).transforms);
    return [...this.pages().values()].find((p) => p.kind === 'continent' && p.mapId === placed.mapId);
  });

  /**
   * The zones of the page shown: its regions' shapes (continents, world, cosmic), or on a zone the shapes of its
   * continent's zones where they are on the zone's picture (the zone itself and its neighbours).
   */
  protected readonly zoneShapes = computed<GameMapShapes | undefined>(() => {
    const page = this.page();
    if (!page) {
      return undefined;
    }
    if (page.regions.length) {
      return this.shapes().get(page.key);
    }
    const continent = this.continent();
    return continent && this.shapes().has(continent.key) ? this.zoneFrameShapes(page, continent) : undefined;
  });

  private readonly zoneEdges = computed(() => {
    const shapes = this.zoneShapes();
    return shapes && shapeEdges(shapes.labels);
  });

  /** The colours and borders over the picture. */
  protected readonly layersImage = computed(() => {
    const page = this.page();
    const shapes = this.zoneShapes();
    const picture = this.picture();
    const shown = this.shown();
    if (!page) {
      return undefined;
    }
    const zones = (this.data() as GameMapData).zones;
    const zoneOf = (label: number) => zones.get((firstPage(this.pages(), (shapes as GameMapShapes).keys[label - 1]) as GamePage).areaId);
    const color = shown.has('territory') ? territoryColor : shown.has('levels') ? levelColor : undefined;
    const subLabels = page.kind === 'zone' && typeof picture === 'object' && picture ? picture.picture.labels : undefined;
    const image = paintShapes({
      labels: page.kind === 'continent' ? shapes?.labels : undefined,
      fill: color && ((label: number) => color(zoneOf(label))),
      edges: shown.has('borders') && page.kind !== 'cosmic' ? this.zoneEdges() : undefined,
      subEdges: shown.has('subBorders') && subLabels ? shapeEdges(subLabels) : undefined,
    });
    return image && imageToPngUrl(image);
  });

  /** The zone (or continent, or world) under the pointer, by its label. */
  protected readonly hoverLabel = computed(() => {
    const hover = this.hover();
    const shapes = this.zoneShapes();
    return hover && shapes ? labelAt(shapes.labels, hover.point) : 0;
  });

  /** The page the zone under the pointer opens: none when it is the zone shown. */
  protected readonly hoverTarget = computed(() => {
    const label = this.hoverLabel();
    const page = this.page();
    const target = label ? firstPage(this.pages(), (this.zoneShapes() as GameMapShapes).keys[label - 1]) : undefined;
    return target && target.mapAreaId !== page?.mapAreaId ? target : undefined;
  });

  protected readonly hoverImage = computed(() => {
    const label = this.hoverLabel();
    const shapes = this.zoneShapes();
    return label && this.hoverTarget() && shapes
      ? imageToPngUrl(paintHover(shapes.labels, this.zoneEdges() as Uint8Array, label))
      : undefined;
  });

  /** Zone names on the picture: a continent's zones, or a zone's neighbours (which a click opens). */
  protected readonly labels = computed<GameLabel[]>(() => {
    const shapes = this.zoneShapes();
    const page = this.page();
    if (!shapes || !page || !this.shown().has('names') || page.kind === 'cosmic') {
      return [];
    }
    const labels: GameLabel[] = [];
    shapeCentres(shapes.labels).forEach(({ u, v, size }, label) => {
      const target = firstPage(this.pages(), shapes.keys[label - 1]);
      if (target && size >= NAME_MIN_PIXELS && target.mapAreaId !== page.mapAreaId) {
        labels.push({ key: target.key, u, v, text: this.pageName(target), page: target.key });
      }
    });
    return labels;
  });

  /** The sub-zone under the pointer on a zone. */
  private readonly hoverOverlay = computed<GameMapOverlay | undefined>(() => {
    const hover = this.hover();
    const picture = this.picture();
    const label = hover && typeof picture === 'object' && picture ? labelAt(picture.picture.labels, hover.point) : 0;
    return label ? this.overlays()[label - 1] : undefined;
  });

  /** What the tooltip says: the zone a click opens, with its levels and land; or the sub-zone and the coordinates. */
  protected readonly tooltip = computed(() => {
    const hover = this.hover();
    const page = this.page();
    if (!hover || !page || this.hoverPin()) {
      return undefined;
    }
    const target = this.hoverTarget();
    if (target) {
      const zone = this.data()?.zones.get(target.areaId);
      return { x: hover.x, y: hover.y, title: this.pageName(target), lines: zone ? this.zoneLines(zone) : [], open: true };
    }
    if (!page.bounds || page.kind === 'continent') {
      return undefined;
    }
    const overlay = this.hoverOverlay();
    const area = overlay ? this.areaName(overlay.areaIds[0]) : '';
    const coords = `${(hover.point.u * 100).toFixed(1)}, ${(hover.point.v * 100).toFixed(1)}`;
    return { x: hover.x, y: hover.y, title: area || this.areaName(page.areaId), lines: [coords], open: false };
  });

  /** The markers of the page: points of interest, instance entrances and (when asked) the 3D view's spawns. */
  protected readonly pins = computed<GamePin[]>(() => {
    const page = this.page();
    if (!page?.bounds) {
      return [];
    }
    const shown = this.shown();
    const pins: GamePin[] = [];
    if (shown.has('spawns') && page.mapId === this.mapId()) {
      for (const dot of this.dots()) {
        const point = this.placeOn(page, page.mapId, dot.position);
        if (point && pins.length < MAX_DOTS) {
          pins.push({
            key: dot.key,
            ...point,
            title: dot.title ?? '',
            lines: [],
            color: dot.color,
            position: dot.position,
            mapId: page.mapId,
          });
        }
      }
    }
    const layers = new Map(GAME_MAP_LAYERS.map((layer) => [layer.key, layer]));
    const factions = this.factions();
    this.pois().forEach((poi, i) => {
      const layer = layers.get(poi.kind);
      const point = layer && shown.has(poi.kind) ? this.placeOn(page, poi.mapId, poi) : undefined;
      if (layer && point) {
        const side = factions && poi.faction ? factionSide(factions.templates.get(poi.faction)) : undefined;
        pins.push({
          key: `poi:${i}`,
          ...point,
          title: poi.name,
          lines: [poi.subname ? `<${poi.subname}>` : '', this.translate.instant(layer.label)].filter(Boolean),
          icon: layer.icon && this.icons().get(layer.icon),
          fa: layer.fa,
          side,
          position: poi,
          mapId: poi.mapId,
        });
      }
    });
    pins.push(...this.entrances().filter((pin) => shown.has(pin.key.split(':')[1])));
    return pins;
  });

  /** Entrances of instances on the page: area triggers teleporting to a dungeon's or raid's map. */
  private readonly entrances = computed<GamePin[]>(() => {
    // (asked only for a page with a picture)
    const page = this.page() as GamePage;
    // (asked for when the page was opened)
    const triggers = this.triggers().get(page.mapId) as AreaTriggerInfo[];
    const maps = new Map(this.maps().map((m) => [m.id, m]));
    const byTrigger = new Map(this.teleports().map((t) => [t.id, t]));
    const seen = new Set<number>();
    const pins: GamePin[] = [];
    for (const trigger of triggers) {
      const teleport = byTrigger.get(trigger.id);
      const target = teleport && maps.get(teleport.targetMap);
      const kind = target?.instanceType === INSTANCE_DUNGEON ? 'dungeon' : target?.instanceType === INSTANCE_RAID ? 'raid' : undefined;
      const point = kind && target && !seen.has(target.id) ? this.placeOn(page, trigger.mapId, trigger) : undefined;
      if (kind && target && point) {
        seen.add(target.id);
        const opens = [...this.pages().values()].find((p) => p.mapId === target.id && p.kind !== 'continent');
        const layer = GAME_MAP_LAYERS.find((l) => l.key === kind) as GameMapLayer;
        pins.push({
          key: `entrance:${kind}:${target.id}`,
          ...point,
          title: target.name,
          lines: [this.translate.instant(layer.label), opens ? this.translate.instant('WORLD_EDITOR.GAME_MAP_OPEN_MAP') : ''].filter(
            Boolean,
          ),
          icon: layer.icon && this.icons().get(layer.icon),
          opens: opens && (firstPage(this.pages(), `area:${opens.mapAreaId}`) as GamePage).key,
          position: { x: trigger.x, y: trigger.y, z: trigger.z },
          mapId: trigger.mapId,
        });
      }
    }
    return pins;
  });

  /** The routes of the transports with a stop on the page's map, by kind shown. */
  protected readonly routes = computed<GameRoute[]>(() => {
    const page = this.page();
    if (!page?.bounds) {
      return [];
    }
    const shown = this.shown();
    const paths = new Map((this.taxiPaths().get(page.mapId) ?? []).map((path) => [path.id, path]));
    const factions = this.factions();
    const routes: GameRoute[] = [];
    for (const transport of this.transports()) {
      const path = paths.get(transport.path);
      if (!path || !shown.has(transportKind(transport.name))) {
        continue;
      }
      const lines: string[] = [];
      let run: string[] = [];
      for (const point of path.points) {
        const at = this.placeOn(page, page.mapId, point);
        if (at) {
          run.push(`${Math.round(at.u * 1000)},${Math.round(at.v * 1000)}`);
        } else if (run.length) {
          lines.push(run.join(' '));
          run = [];
        }
      }
      if (run.length) {
        lines.push(run.join(' '));
      }
      if (lines.some((line) => line.includes(' '))) {
        const side = factionSide(factions?.templates.get(transport.faction));
        routes.push({ key: `route:${transport.entry}`, name: transport.name, color: ROUTE_COLORS[side ?? 'neutral'], lines });
      }
    }
    return routes;
  });

  protected readonly cameraPin = computed(() => {
    const page = this.page();
    const camera = this.camera();
    const mapId = this.mapId();
    return page?.bounds && camera && mapId !== undefined && this.shown().has('camera') ? this.placeOn(page, mapId, camera) : undefined;
  });

  /** Whether the zone shown is on the map the camera is on (its spawns can be loaded). */
  protected readonly canLoadZone = computed(() => {
    const page = this.page();
    return !!page?.bounds && page.kind !== 'continent' && page.mapId === this.mapId();
  });

  constructor() {
    const started = performance.now();
    void this.client
      .getGameMap()
      .then((data) => {
        perfNote(`game map: opened, its data read in ${Math.round(performance.now() - started)} ms`);
        this.data.set(data);
      })
      .catch((error: Error) => {
        console.warn('[World Editor] Could not read the world map:', error);
        this.failed.set(true);
      });
    void this.client
      .getFactions()
      .then((factions) => this.factions.set(factions))
      .catch((error: Error) => console.warn('[World Editor] Could not read the factions for the world map:', error));
    // open where the camera is
    effect(() => {
      if (this.pages().size && !untracked(this.pageKey)) {
        untracked(() => this.showCamera());
      }
    });
    // the page's picture, its zones' shapes, and what its markers need
    effect(() => {
      const page = this.page();
      const overlays = this.overlays();
      const continent = this.continent();
      untracked(() => {
        if (page) {
          perfNote(`game map: page ${page.key} (${page.prefix})`);
          void this.load(page, overlays);
          void this.loadShapes(continent ?? page);
        }
      });
    });
    // the icons, once the client is read
    effect(() => {
      if (this.data()) {
        untracked(() => {
          const paths = [...GAME_MAP_LAYERS.map((layer) => layer.icon), SIDE_BADGES.alliance, SIDE_BADGES.horde];
          paths.forEach((path) => path && void this.loadIcon(path));
        });
      }
    });
  }

  protected readonly sideBadges = SIDE_BADGES;

  /** Opens the page where the camera is. */
  protected showCamera(): void {
    const camera = this.camera();
    const mapId = this.mapId();
    if (camera && mapId !== undefined) {
      this.show(pageAt(this.pages(), mapId, camera.x, camera.y, this.zoneId()).key);
    } else {
      this.show('world');
    }
  }

  /** Opens a page (every link points at one that exists). */
  protected open(key: string): void {
    this.show((firstPage(this.pages(), key) as GamePage).key);
  }

  private show(key: string): void {
    void this.loadMapData((this.pages().get(key) as GamePage).mapId);
    this.pageKey.set(key);
    this.hover.set(undefined);
    this.hoverPin.set(undefined);
    this.zoom.set(1);
    this.pan.set({ x: 0, y: 0 });
    this.openedAt = Date.now();
  }

  protected openChild(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.open(select.value);
    select.value = '';
  }

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
  private placeOn(page: GamePage, mapId: number, place: { x: number; y: number }): GameMapPoint | undefined {
    let [x, y] = [place.x, place.y];
    if (mapId !== page.mapId) {
      const move =
        page.kind === 'continent'
          ? (this.data() as GameMapData).transforms.find(
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

  /**
   * The shapes of a continent's zones on one zone's picture (the zone and its neighbours), traced from their highlights
   * drawn in the zone's frame, so they are as sharp there as on the continent.
   */
  private zoneFrameShapes(page: GamePage, continent: GamePage): GameMapShapes {
    const transforms = (this.data() as GameMapData).transforms;
    const frame = onContinent({ mapId: page.mapId, bounds: page.bounds as WorldBounds }, transforms).bounds;
    const highlights = this.highlights();
    const sources: ShapeSource[] = continent.regions.map((region) => {
      const zone = this.pages().get(region.page) as GamePage;
      const placed = onContinent({ mapId: zone.mapId, bounds: zone.bounds as WorldBounds }, transforms).bounds;
      const [a, b] = [toGameMap(frame, placed.maxX, placed.maxY), toGameMap(frame, placed.minX, placed.minY)];
      return {
        key: region.page,
        rect: { left: a.u, top: a.v, right: b.u, bottom: b.v },
        image: highlights.get(region.highlight as string) ?? undefined,
      };
    });
    // gaps as wide as on the continent
    const scale = (continent.bounds as WorldBounds).maxY - (continent.bounds as WorldBounds).minY;
    return regionShapes(sources, Math.min(8, Math.round((3 * scale) / (frame.maxY - frame.minY))));
  }

  // ------------------------------------------------------------------ pointer: hover, zoom, pan, clicks

  private stageBox(event: MouseEvent): DOMRect {
    return ((event.currentTarget as HTMLElement).querySelector('.game-map-stage') as HTMLElement).getBoundingClientRect();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button === 0) {
      this.press = { x: event.clientX, y: event.clientY, pan: this.pan(), moved: false };
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    const press = this.press;
    if (press) {
      const [dx, dy] = [event.clientX - press.x, event.clientY - press.y];
      press.moved ||= Math.hypot(dx, dy) > CLICK_SLOP;
      if (press.moved) {
        this.pan.set({ x: press.pan.x + dx, y: press.pan.y + dy });
      }
    }
    const box = this.stageBox(event);
    const viewport = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (!box.width || !box.height) {
      return;
    }
    const point = { u: (event.clientX - box.left) / box.width, v: (event.clientY - box.top) / box.height };
    this.hover.set(onGameMap(point) ? { point, x: event.clientX - viewport.left, y: event.clientY - viewport.top } : undefined);
  }

  protected onPointerUp(event: PointerEvent): void {
    const press = this.press;
    this.press = undefined;
    if (!press || press.moved) {
      return;
    }
    const target = this.hoverTarget();
    if (event.ctrlKey || event.metaKey) {
      void this.copyGo();
    } else if (target) {
      this.open(target.key);
    }
  }

  protected onPointerLeave(): void {
    this.press = undefined;
    this.hover.set(undefined);
  }

  /** A double click moves the camera there (not the one that ends a click opening a zone). */
  protected onDoubleClick(): void {
    const page = this.page();
    const hover = this.hover();
    if (!page?.bounds || page.kind === 'continent' || !hover || Date.now() - this.openedAt < DOUBLE_CLICK_AFTER_OPEN) {
      return;
    }
    const { x, y } = fromGameMap(page.bounds, hover.point);
    this.goTo.emit({ mapId: page.mapId, position: { x, y, z: this.heightOn(page) } });
  }

  /** The height a place of a page is taken at: the camera's on its map (the map has no heights), else 0. */
  private heightOn(page: GamePage): number {
    return page.mapId === this.mapId() ? (this.camera()?.z ?? 0) : 0;
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const viewport = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const [px, py] = [event.clientX - viewport.left - viewport.width / 2, event.clientY - viewport.top - viewport.height / 2];
    const before = this.zoom();
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, before * (event.deltaY < 0 ? 1.25 : 0.8)));
    const pan = this.pan();
    // keep the point under the pointer where it is
    this.pan.set(zoom === MIN_ZOOM ? { x: 0, y: 0 } : { x: px - ((px - pan.x) / before) * zoom, y: py - ((py - pan.y) / before) * zoom });
    this.zoom.set(zoom);
  }

  protected zoomBy(factor: number): void {
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom() * factor));
    const pan = this.pan();
    this.pan.set(zoom === MIN_ZOOM ? { x: 0, y: 0 } : { x: (pan.x / this.zoom()) * zoom, y: (pan.y / this.zoom()) * zoom });
    this.zoom.set(zoom);
  }

  /** Ctrl + click: a `.go` command for the place under the pointer (`zonexy` on a zone, `xyz` elsewhere). */
  private async copyGo(): Promise<void> {
    const page = this.page();
    const hover = this.hover();
    if (!page?.bounds || page.kind === 'continent' || !hover) {
      return;
    }
    const { x, y } = fromGameMap(page.bounds, hover.point);
    const z = this.heightOn(page);
    const command =
      page.kind === 'zone'
        ? `.go zonexy ${(hover.point.u * 100).toFixed(1)} ${(hover.point.v * 100).toFixed(1)} ${page.areaId}`
        : `.go xyz ${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)} ${page.mapId}`;
    try {
      await navigator.clipboard.writeText(command);
      this.copied.set(command);
    } catch (error) {
      console.warn('[World Editor] Could not copy the .go command:', error);
    }
  }

  protected onPinEnter(pin: GamePin, event: MouseEvent): void {
    const viewport = (event.currentTarget as HTMLElement).closest('.game-map-viewport') as HTMLElement;
    const box = viewport.getBoundingClientRect();
    this.hoverPin.set({ pin, x: event.clientX - box.left, y: event.clientY - box.top });
  }

  protected onPinLeave(): void {
    this.hoverPin.set(undefined);
  }

  /** A click on an instance's entrance opens its map. */
  protected onPinClick(pin: GamePin, event: Event): void {
    event.stopPropagation();
    if (pin.opens) {
      this.open(pin.opens);
    }
  }

  /** A double click on a marker moves the camera to it. */
  protected onPinDoubleClick(pin: GamePin, event: Event): void {
    event.stopPropagation();
    this.goTo.emit({ mapId: pin.mapId, position: pin.position });
  }

  protected loadZone(): void {
    this.regionSelected.emit((this.page() as GamePage).bounds as WorldBounds);
  }

  // ------------------------------------------------------------------ layers

  protected toggleLayer(key: string): void {
    const shown = new Set(this.shown());
    if (!shown.delete(key)) {
      shown.add(key);
    }
    // level and faction colours don't mix
    if (key === 'levels' && shown.has('levels')) {
      shown.delete('territory');
    } else if (key === 'territory' && shown.has('territory')) {
      shown.delete('levels');
    }
    this.setShown(shown);
  }

  protected setGroup(group: GameMapLayerGroup, on: boolean): void {
    const shown = new Set(this.shown());
    group.layers.forEach((layer) => (on ? shown.add(layer.key) : shown.delete(layer.key)));
    if (on && group.key === 'map') {
      shown.delete('territory');
    }
    this.setShown(shown);
  }

  protected groupState(group: GameMapLayerGroup): 'all' | 'some' | 'none' {
    const count = group.layers.filter((layer) => this.shown().has(layer.key)).length;
    return count === group.layers.length ? 'all' : count ? 'some' : 'none';
  }

  protected resetLayers(): void {
    this.setShown(new Set(GAME_MAP_LAYERS.filter((layer) => layer.shown).map((layer) => layer.key)));
  }

  private setShown(shown: Set<string>): void {
    this.shown.set(shown);
    saveShownLayers(shown);
  }

  protected setMarkerSize(event: Event): void {
    const size = MARKER_SIZES[Number((event.target as HTMLInputElement).value)];
    this.markerSize.set(size);
    saveMarkerSize(size);
  }

  protected markerSizeIndex(): number {
    return MARKER_SIZES.indexOf(this.markerSize());
  }

  // ------------------------------------------------------------------ loading

  private async load(page: GamePage, overlays: GameMapOverlay[]): Promise<void> {
    if (this.pictures().has(page.prefix)) {
      return;
    }
    this.pictures.update((map) => new Map(map).set(page.prefix, 'loading'));
    const started = performance.now();
    const picture = await this.client.getGameMapPicture(page, overlays).catch((error: Error) => {
      console.warn(`[World Editor] Could not draw the world map ${page.prefix}:`, error);
      return undefined;
    });
    perfNote(`game map: ${page.prefix} ${picture ? 'shown' : 'has no picture'} after ${Math.round(performance.now() - started)} ms`);
    this.pictures.update((map) => new Map(map).set(page.prefix, picture ? { url: imageToDataUrl(picture.image), picture } : null));
  }

  /** The shapes of a page's regions, from their highlights (read once). */
  private async loadShapes(page: GamePage): Promise<void> {
    if (!page.regions.length || this.shapes().has(page.key)) {
      return;
    }
    // (marked first: asked once)
    this.shapes.update((map) => new Map(map).set(page.key, { labels: new Uint16Array(SHAPE_WIDTH * SHAPE_HEIGHT), keys: [] }));
    const sources: ShapeSource[] = [];
    for (const region of page.regions) {
      const path = region.highlight;
      const highlight = path ? await this.client.getTexture(path).catch(() => undefined) : undefined;
      if (path) {
        this.highlights.update((map) => new Map(map).set(path, highlight ?? null));
      }
      sources.push({
        key: region.page,
        rect: region.rect,
        circle: region.circle,
        image: highlight,
        outline: region.outline,
        crop: !region.outline,
      });
    }
    const shapes = regionShapes(sources);
    perfNote(`game map: shapes of ${page.key}, ${sources.filter((s) => s.image || s.circle).length} of ${sources.length} regions`);
    this.shapes.update((map) => new Map(map).set(page.key, shapes));
  }

  /** The area triggers and transport paths of a map (read once each). */
  private async loadMapData(mapId: number): Promise<void> {
    if (!this.triggers().has(mapId)) {
      this.triggers.update((map) => new Map(map).set(mapId, []));
      const triggers = await this.client.getAreaTriggers(mapId).catch(() => []);
      this.triggers.update((map) => new Map(map).set(mapId, triggers));
    }
    if (!this.taxiPaths().has(mapId)) {
      this.taxiPaths.update((map) => new Map(map).set(mapId, []));
      const paths = await this.client.getTaxiPaths(mapId).catch(() => []);
      this.taxiPaths.update((map) => new Map(map).set(mapId, paths));
    }
  }

  private async loadIcon(path: string): Promise<void> {
    const image: RgbaImage | undefined = await this.client.getTexture(path).catch(() => undefined);
    if (image) {
      this.icons.update((map) => new Map(map).set(path, imageToPngUrl(image)));
    }
  }
}
