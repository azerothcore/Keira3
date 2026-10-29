import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import {
  AREA_CAPITAL,
  AREA_SANCTUARY,
  AreaTriggerInfo,
  cropImage,
  edgeButton,
  FactionData,
  firstPage,
  fromGameMap,
  GameMapData,
  GameMapOverlay,
  GameMapPicture,
  GameMapPoint,
  GameMapRegion,
  GamePage,
  gameMapPages,
  GameZone,
  labelPoint,
  onContinent,
  onGameMap,
  outlinesTouch,
  pageAt,
  pageChildren,
  pageFloors,
  perfNote,
  pointInRings,
  Ring,
  ringsArea,
  ringsPath,
  TaxiPath,
  toGameMap,
  WorldBounds,
  WorldPosition,
  WowClientService,
  WowMap,
} from '@keira/shared/wow-data';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { cssRgb, LEVEL_BANDS, levelColor, territoryColor } from './game-map-layers';
import {
  ATLAS,
  CONTINENT_LAYERS,
  factionSide,
  GAME_MAP_LAYER_GROUPS,
  GAME_MAP_LAYERS,
  GAME_MAP_OPTIONS,
  GameMapIcon,
  GameMapLayer,
  GameMapLayerGroup,
  GameMapPoi,
  GameMapTeleport,
  GameMapTransport,
  loadMarkerSize,
  loadShownLayers,
  MARKER_SIZES,
  POI_ATLAS,
  POI_ATLAS_CELL,
  POI_ATLAS_COLUMNS,
  POI_ATLAS_PITCH,
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
/** Zones whose outlines on their continent come this close (percent) are neighbours. */
const NEIGHBOUR_TOUCH = 1;
/** Markers of one kind (and side) closer than this (percent of the map, each way) are shown as one. */
const MERGE_DISTANCE = 0.8;
/** Wintergrasp (AreaTable), marked for its world PvP on Northrend. */
const WINTERGRASP = 4197;
/** Instance types (Map.dbc) of dungeons and raids. */
const INSTANCE_DUNGEON = 1;
const INSTANCE_RAID = 2;
/** A transport's line, by side. */
const ROUTE_COLORS = { alliance: '#4d8dff', horde: '#ff4d4d', neutral: '#ffd200' };

type Side = 'alliance' | 'horde';

/** A marker on the picture, in fractions of it. */
interface GamePin {
  key: string;
  u: number;
  v: number;
  title: string;
  lines: string[];
  /** A spawn's dot colour. */
  color?: string;
  icon?: GameMapIcon;
  side?: Side;
  /** An instance's entrance (or a zone's shield) opens its map. */
  opens?: string;
  position: WorldPosition;
  mapId: number;
  /** Its layer, when markers of it nearby can be shown as one; how many more are there then. */
  kind?: string;
  more?: number;
}

/** A transport's route on the picture. */
interface GameRoute {
  key: string;
  name: string;
  color: string;
  /** Its runs on the picture, as SVG points (0..1000). */
  lines: string[];
}

/** A shape drawn over the picture: a zone (coloured by level or land), a neighbour, or a sub-zone. */
interface GameShape {
  /** The page it opens (a zone, a continent…), or a sub-zone's area id. */
  key: string;
  d: string;
  kind: 'zone' | 'plain' | 'neighbour' | 'sub';
  color?: string;
}

/**
 * A chip on a zone's picture naming a neighbouring zone (with its levels) that opens it: on the part of it the picture
 * shows, or (none shown) at the edge facing it, `edge` being that edge.
 */
interface GameLabel {
  key: string;
  u: number;
  v: number;
  text: string;
  levels?: string;
  edge?: string;
  /** Its size, in percent of the picture (to keep chips apart). */
  w: number;
  h: number;
}

/** The world map's icon atlas cells this map uses. */
const ATLAS_CELLS = [
  ATLAS.graveyard,
  ATLAS.allianceCrest,
  ATLAS.hordeCrest,
  ...Object.values(ATLAS.zeppelin),
  ...Object.values(ATLAS.boat),
];
/** An icon's key among the loaded pictures. */
export const iconKey = (icon: GameMapIcon): string =>
  icon.atlas !== undefined ? `${icon.path}#${icon.atlas}` : icon.crop ? `${icon.path}@${icon.crop.join(',')}` : (icon.path as string);
const atlasIcon = (atlas: number): GameMapIcon => ({ path: POI_ATLAS, atlas });

/** The shape under a point of the picture, by its key. */
function shapeAt(shapes: Map<string, Ring[]>, point: GameMapPoint): string | undefined {
  for (const [key, rings] of shapes) {
    if (pointInRings(point.u * 100, point.v * 100, rings)) {
      return key;
    }
  }
  return undefined;
}

/** Markers of one kind (and side) on top of each other shown as one, with how many more there are. */
function mergePins(pins: GamePin[]): GamePin[] {
  const merged: GamePin[] = [];
  for (const pin of pins) {
    const near =
      pin.kind &&
      merged.find(
        (other) =>
          other.kind === pin.kind &&
          other.side === pin.side &&
          Math.abs(other.u - pin.u) * 100 <= MERGE_DISTANCE &&
          Math.abs(other.v - pin.v) * 100 <= MERGE_DISTANCE,
      );
    if (near) {
      near.more = (near.more ?? 0) + 1;
    } else {
      merged.push(pin);
    }
  }
  return merged;
}

/**
 * The in-game world map, made at run time from the user's own client (pictures and DBCs; nothing of the client ships
 * with Keira), like AoWoW's maps: the cosmic map, the world map, the continents, their zones and the floors of
 * instances. Zones are outlined as AoWoW traces them (from the client's highlights), coloured by level or faction; the
 * zone under the pointer lights up and a click opens it, neighbouring zones too (dotted, with a chip naming them).
 * Sub-zones are outlined and named, with the game's coordinates. The wheel zooms and dragging pans. Markers
 * (townsfolk, professions, vendors, transports, instance entrances, and the 3D view's spawns when asked) use the
 * client's own icons, with a crest for the side they serve. A double click moves the camera there; Ctrl + click
 * copies a `.go` command.
 */
@Component({
  selector: 'keira-game-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './game-map.component.html',
  styleUrl: './game-map.component.scss',
  host: { '[style.--marker.px]': 'pinSize()' },
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
  /**
   * Outlines traced from the client's pictures (as AoWoW traces them), in percent of the picture: a page's regions
   * (`regions:<page>`, by the page each one opens), a zone's sub-zones (`subzones:<page>`, by area id) and the parts of
   * its neighbours it shows (`neighbours:<page>`); empty while being traced.
   */
  private readonly outlines = signal(new Map<string, Map<string, Ring[]>>());
  protected readonly shown = signal(loadShownLayers());
  protected readonly markerSize = signal(loadMarkerSize());
  protected readonly markerSizes = MARKER_SIZES;
  protected readonly showPanel = signal(true);
  protected readonly options = GAME_MAP_OPTIONS;
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
  /** The icons (and crests) as pictures, by `iconKey`. */
  protected readonly icons = signal(new Map<string, string>());
  private readonly factions = signal<FactionData | undefined>(undefined);
  private readonly triggers = signal(new Map<number, AreaTriggerInfo[]>());
  private readonly taxiPaths = signal(new Map<number, TaxiPath[]>());
  private press?: { x: number; y: number; pan: { x: number; y: number }; moved: boolean };
  private openedAt = 0;

  /** Markers are smaller on continents, as on AoWoW's. */
  protected readonly pinSize = computed(() => Math.round(this.markerSize() * (this.page()?.kind === 'continent' ? 0.8 : 1)));

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
   * What a click on the page shown opens: its regions (a continent's zones, the world map's continents, the cosmic map's
   * worlds), or on a zone the parts of its neighbours it shows; by page.
   */
  protected readonly regions = computed(() => {
    const page = this.page() as GamePage;
    return this.outlines().get(page.regions.length ? `regions:${page.key}` : `neighbours:${page.key}`) ?? new Map<string, Ring[]>();
  });

  /** The sub-zones of the zone shown, by area id. */
  private readonly subzones = computed(() => {
    const page = this.page();
    return (page && this.outlines().get(`subzones:${page.key}`)) ?? new Map<string, Ring[]>();
  });

  /** The page a region opens (none for a region whose page the client doesn't have). */
  private targetOf(key: string): GamePage | undefined {
    return firstPage(this.pages(), key);
  }

  /** The shapes drawn over the picture: zones (coloured on continents), neighbours on a zone, and its sub-zones. */
  protected readonly zonePaths = computed<GameShape[]>(() => {
    const page = this.page();
    const shown = this.shown();
    if (!page) {
      return [];
    }
    const zones = (this.data() as GameMapData).zones;
    const color = this.colored() ? (shown.has('territory') ? territoryColor : levelColor) : undefined;
    const paths: GameShape[] = [];
    this.regions().forEach((rings, key) => {
      const target = this.targetOf(key);
      if (!target) {
        return;
      }
      const d = ringsPath(rings);
      if (page.kind === 'zone') {
        if (shown.has('transitions')) {
          paths.push({ key, d, kind: 'neighbour' });
        }
      } else {
        const rgb = color?.(zones.get(target.areaId));
        paths.push({ key, d, kind: rgb ? 'zone' : 'plain', color: rgb && cssRgb(rgb) });
      }
    });
    return paths;
  });

  /** Whether the zones are coloured (on continents, by level or land). */
  protected readonly colored = computed(
    () => this.page()?.kind === 'continent' && (this.shown().has('levels') || this.shown().has('territory')),
  );

  protected readonly subPaths = computed<GameShape[]>(() =>
    this.shown().has('subBorders') ? [...this.subzones()].map(([key, rings]) => ({ key, d: ringsPath(rings), kind: 'sub' as const })) : [],
  );

  /** Whether zone borders are drawn (on continents, the world map). */
  protected readonly borders = computed(() => this.shown().has('borders'));

  /** The region under the pointer (a zone, a continent, a world; a neighbour on a zone), by the page it opens. */
  protected readonly hoverKey = computed(() => {
    const hover = this.hover();
    return hover && this.page() ? shapeAt(this.regions(), hover.point) : undefined;
  });

  /** The page the region under the pointer opens. */
  protected readonly hoverTarget = computed(() => {
    const key = this.hoverKey();
    return key ? this.targetOf(key) : undefined;
  });

  /** The sub-zone under the pointer on a zone, by area id. */
  protected readonly hoverSub = computed(() => {
    const hover = this.hover();
    return hover ? shapeAt(this.subzones(), hover.point) : undefined;
  });

  /**
   * Chips naming the neighbours of a zone (a click opens them): on the part of each the picture shows (the biggest
   * parts placed first, the others moved off them), else at the edge facing it. Continents and worlds name nothing:
   * their pictures have the names.
   */
  protected readonly labels = computed<GameLabel[]>(() => {
    const page = this.page();
    if (page?.kind !== 'zone' || !this.shown().has('names')) {
      return [];
    }
    const placed: GameLabel[] = [];
    const parts = [...this.regions()].sort(([, a], [, b]) => ringsArea(b) - ringsArea(a));
    for (const [key, rings] of parts) {
      const target = this.targetOf(key);
      if (target) {
        const [x, y] = labelPoint(rings);
        placed.push(this.chip(target, x, y, placed));
      }
    }
    // neighbours on the continent that the picture doesn't show (not the cities inside the zone: they are sub-zones)
    const continent = this.continent();
    const zones = continent && this.outlines().get(`regions:${continent.key}`);
    const own = zones?.get(page.key);
    if (zones && own) {
      // (a zone with an outline on its continent is one of its regions)
      const { left, top, right, bottom } = ((continent as GamePage).regions.find((r) => r.page === page.key) as GameMapRegion).rect;
      const frame: [number, number, number, number] = [left * 100, top * 100, right * 100, bottom * 100];
      const subzones = this.subzones();
      zones.forEach((rings, key) => {
        const target = this.targetOf(key);
        const hidden = key !== page.key && !this.regions().has(key) && target && !subzones.has(String(target.areaId));
        if (hidden && outlinesTouch(own, rings, NEIGHBOUR_TOUCH)) {
          const { x, y, side } = edgeButton(frame, labelPoint(rings));
          placed.push({ ...this.chip(target, x, y, placed), edge: side });
        }
      });
    }
    return placed;
  });

  /** A neighbour's chip at a place (percent of the picture), moved up or down off the chips already placed. */
  private chip(target: GamePage, x: number, y: number, placed: GameLabel[]): GameLabel {
    const levels = this.levelsOf(target);
    const text = this.pageName(target);
    const levelText = levels && `${levels[0]}–${levels[1]}`;
    // (about 6 pixels a letter, of the picture's 1002 × 668)
    const w = (((text.length + (levelText?.length ?? 0)) * 6 + 34) * 100) / 1002;
    const h = (22 * 100) / 668;
    const clamp = (value: number, size: number) => Math.min(100 - size / 2, Math.max(size / 2, value));
    const free = (v: number) => placed.every((p) => Math.abs(p.u * 100 - x) >= (p.w + w) / 2 || Math.abs(p.v * 100 - v) >= (p.h + h) / 2);
    // (where it is, when there's no free place near)
    const [v] = [...[0, 1, -1, 2, -2, 3, -3].map((k) => clamp(y + k * h, h)).filter(free), clamp(y, h)];
    return { key: target.key, u: clamp(x, w) / 100, v: v / 100, text, levels: levelText, w, h };
  }

  /** What the tooltip says: the zone a click opens, its levels and land; or (on a zone) the sub-zone under the pointer. */
  protected readonly tooltip = computed(() => {
    const hover = this.hover();
    const page = this.page();
    if (!hover || !page || this.hoverPin()) {
      return undefined;
    }
    const target = this.hoverTarget();
    if (target) {
      const levels = this.levelsOf(target);
      return {
        x: hover.x,
        y: hover.y,
        title: this.pageName(target),
        levels: this.levelLine(target, levels),
        land: this.landText(target),
        hint: this.translate.instant(page.kind === 'zone' ? 'WORLD_EDITOR.GAME_MAP_OTHER_AREA' : 'WORLD_EDITOR.GAME_MAP_CLICK_OPENS'),
      };
    }
    const sub = this.hoverSub();
    if (!page.bounds || page.kind === 'continent' || (!sub && page.kind === 'zone')) {
      return undefined;
    }
    const area = this.areaName(sub ? Number(sub) : page.areaId);
    return { x: hover.x, y: hover.y, title: area, levels: undefined, land: undefined, hint: this.areaName(page.areaId) };
  });

  /** The game's coordinates of the place under the pointer (zones and floors). */
  protected readonly coordinates = computed(() => {
    const hover = this.hover();
    const page = this.page();
    return hover && page?.bounds && page.kind !== 'continent'
      ? `${(hover.point.u * 100).toFixed(1)}, ${(hover.point.v * 100).toFixed(1)}`
      : undefined;
  });

  /**
   * The markers of the page: points of interest, transports, instance entrances, zones' shields and (when asked) the 3D
   * view's spawns. Continents show only how to get around and where the instances are; a zone only its own markers.
   * Markers of one kind on top of each other are one.
   */
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
      const point = layer?.icon && this.showsLayer(poi.kind) ? this.placeOn(page, poi.mapId, poi) : undefined;
      if (layer && point && this.belongs(page, poi.mapId, poi, poi.zoneId)) {
        pins.push({
          key: `poi:${i}`,
          ...point,
          title: poi.name,
          lines: [poi.subname ? `<${poi.subname}>` : '', this.translate.instant(layer.label)].filter(Boolean),
          icon: layer.icon,
          side: factionSide(factions?.templates.get(poi.faction ?? 0)),
          position: poi,
          mapId: poi.mapId,
          kind: poi.kind,
        });
      }
    });
    pins.push(
      ...this.transportPins(),
      ...this.entrances().filter((pin) => this.showsLayer(pin.key.split(':')[1]) && this.belongs(page, pin.mapId, pin.position)),
      ...this.territoryPins().filter((pin) => shown.has(pin.kind as string)),
    );
    return mergePins(pins);
  });

  /** Whether a layer's markers are shown on the page (on continents only some layers are). */
  private showsLayer(key: string): boolean {
    return this.shown().has(key) && (this.page()?.kind !== 'continent' || CONTINENT_LAYERS.has(key));
  }

  /**
   * Whether a marker belongs on the page: on a zone, when its zone is that zone (its zone unknown: when it is inside the
   * zone's outline on its continent); everything on a city's picture (as AoWoW: a city's outline is only a rough ellipse),
   * and on other pages.
   */
  private belongs(page: GamePage, mapId: number, place: { x: number; y: number }, zoneId?: number): boolean {
    const zone = (this.data() as GameMapData).zones.get(page.areaId);
    if (page.kind !== 'zone' || (zone && zone.flags & AREA_CAPITAL)) {
      return true;
    }
    if (zoneId) {
      return zoneId === page.areaId;
    }
    const continent = this.continent();
    const own = continent && this.outlines().get(`regions:${continent.key}`)?.get(page.key);
    const point = own && this.placeOn(continent, mapId, place);
    return !point || pointInRings(point.u * 100, point.v * 100, own);
  }

  /** On a continent, a shield on each zone of a side (whose land it is) and swords on Wintergrasp (its world PvP). */
  private readonly territoryPins = computed<GamePin[]>(() => {
    const page = this.page() as GamePage;
    const outlines = page.kind === 'continent' ? this.outlines().get(`regions:${page.key}`) : undefined;
    const pins: GamePin[] = [];
    outlines?.forEach((rings, key) => {
      const target = this.targetOf(key);
      const zone = target && (this.data() as GameMapData).zones.get(target.areaId);
      const kind = target?.areaId === WINTERGRASP ? 'pvp' : zone?.faction === 1 || zone?.faction === 0 ? 'relations' : undefined;
      if (!target || !kind) {
        return;
      }
      const [x, y] = labelPoint(rings);
      const point = { u: x / 100, v: y / 100 };
      const icon =
        kind === 'pvp'
          ? ((GAME_MAP_LAYERS.find((l) => l.key === 'pvp') as GameMapLayer).icon as GameMapIcon)
          : atlasIcon(zone?.faction === 1 ? ATLAS.allianceCrest : ATLAS.hordeCrest);
      pins.push({
        key: `${kind}:${key}`,
        ...point,
        title: this.pageName(target),
        lines: [
          kind === 'pvp' ? this.translate.instant('WORLD_EDITOR.GAME_MAP_WORLD_PVP') : (this.landText(target) as string),
          this.translate.instant('WORLD_EDITOR.GAME_MAP_OPEN_MAP'),
        ],
        icon,
        opens: target.key,
        position: { ...fromGameMap(page.bounds as WorldBounds, point), z: 0 },
        mapId: page.mapId,
        kind,
      });
    });
    return pins;
  });

  /** Entrances of instances on the page: area triggers teleporting to a dungeon's or raid's map. */
  private readonly entrances = computed<GamePin[]>(() => {
    // (asked only for a page with a picture, whose triggers were asked for when it opened)
    const page = this.page() as GamePage;
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
          icon: layer.icon,
          opens: opens && (firstPage(this.pages(), `area:${opens.mapAreaId}`) as GamePage).key,
          position: { x: trigger.x, y: trigger.y, z: trigger.z },
          mapId: trigger.mapId,
        });
      }
    }
    return pins;
  });

  /** The transports with a stop on the page's map: their routes, and where each run starts and ends. */
  private readonly transportRuns = computed(() => {
    const page = this.page();
    if (!page?.bounds) {
      return [];
    }
    const paths = new Map((this.taxiPaths().get(page.mapId) ?? []).map((path) => [path.id, path]));
    const factions = this.factions();
    const runs: { transport: GameMapTransport; kind: string; side?: Side; lines: GameMapPoint[][] }[] = [];
    for (const transport of this.transports()) {
      const path = paths.get(transport.path);
      if (!path) {
        continue;
      }
      const lines: GameMapPoint[][] = [];
      let run: GameMapPoint[] = [];
      for (const point of path.points) {
        const at = this.placeOn(page, page.mapId, point);
        if (at) {
          run.push(at);
        } else if (run.length) {
          lines.push(run);
          run = [];
        }
      }
      if (run.length) {
        lines.push(run);
      }
      if (lines.some((line) => line.length > 1)) {
        runs.push({ transport, kind: transportKind(transport.name), side: factionSide(factions?.templates.get(transport.faction)), lines });
      }
    }
    return runs;
  });

  protected readonly routes = computed<GameRoute[]>(() =>
    this.shown().has('routes')
      ? this.transportRuns()
          .filter((run) => this.shown().has(run.kind))
          .map(({ transport, side, lines }) => ({
            key: `route:${transport.entry}`,
            name: transport.name,
            color: ROUTE_COLORS[side ?? 'neutral'],
            lines: lines.map((line) => line.map(({ u, v }) => `${Math.round(u * 1000)},${Math.round(v * 1000)}`).join(' ')),
          }))
      : [],
  );

  /** A transport's icon (anchor, zeppelin…) where each of its runs starts on the picture. */
  private readonly transportPins = computed<GamePin[]>(() =>
    this.transportRuns()
      .filter((run) => this.shown().has(run.kind))
      .flatMap(({ transport, kind, side, lines }) =>
        lines.map((line, i) => {
          const icon: GameMapIcon =
            kind === 'boat'
              ? atlasIcon(ATLAS.boat[side ?? 'neutral'])
              : kind === 'transport'
                ? ((GAME_MAP_LAYERS.find((l) => l.key === 'transport') as GameMapLayer).icon as GameMapIcon)
                : atlasIcon(ATLAS.zeppelin[side ?? 'neutral']);
          return {
            key: `transport:${transport.entry}:${i}`,
            ...line[0],
            title: transport.name,
            lines: [],
            icon,
            position: fromGameMap((this.page() as GamePage).bounds as WorldBounds, line[0]) as WorldPosition,
            mapId: (this.page() as GamePage).mapId,
          };
        }),
      ),
  );

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
    // the page's picture and its zones' shapes
    effect(() => {
      const page = this.page();
      const overlays = this.overlays();
      const continent = this.continent();
      untracked(() => {
        if (page) {
          perfNote(`game map: page ${page.key} (${page.prefix})`);
          void this.load(page, overlays);
          this.loadOutlinesOf(page, overlays, continent);
        }
      });
    });
    // the icons, once the client is read
    effect(() => {
      if (this.data()) {
        untracked(() => void this.loadIcons());
      }
    });
  }

  // ------------------------------------------------------------------ pages

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

  /** A page's level range: its zone's, or (continents, worlds) from the lowest to the highest of their zones. */
  private levelsOf(page: GamePage): [number, number] | undefined {
    const zones = (this.data() as GameMapData).zones;
    if (page.kind === 'zone' || page.kind === 'floor') {
      return zones.get(page.areaId)?.levels;
    }
    const ranges = page.regions
      .map((region) => firstPage(this.pages(), region.page))
      .map((target) => target && this.levelsOf(target))
      .filter((levels): levels is [number, number] => !!levels);
    return ranges.length ? [Math.min(...ranges.map((r) => r[0])), Math.max(...ranges.map((r) => r[1]))] : undefined;
  }

  /** "City" for capitals, else the levels when known. */
  private levelLine(page: GamePage, levels: [number, number] | undefined): string | undefined {
    const zone = (this.data() as GameMapData).zones.get(page.areaId);
    if (zone && zone.flags & AREA_CAPITAL) {
      return this.translate.instant('WORLD_EDITOR.GAME_MAP_CITY');
    }
    return levels && this.translate.instant('WORLD_EDITOR.GAME_MAP_LEVELS', { min: levels[0], max: levels[1] });
  }

  /** Whose land a zone is. */
  private landText(page: GamePage): string | undefined {
    const zone: GameZone | undefined = this.data()?.zones.get(page.areaId);
    const land =
      zone && zone.flags & AREA_SANCTUARY
        ? 'SANCTUARY'
        : zone?.faction === 1
          ? 'ALLIANCE'
          : zone?.faction === 0
            ? 'HORDE'
            : zone?.faction === -1
              ? 'CONTESTED'
              : undefined;
    return land && this.translate.instant(`WORLD_EDITOR.GAME_MAP_${land}`);
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

  protected resetZoom(): void {
    this.zoom.set(1);
    this.pan.set({ x: 0, y: 0 });
  }

  /** Ctrl + click: a `.go` command for the place under the pointer (`zonexy` on a zone, `xyz` elsewhere). */
  private async copyGo(): Promise<void> {
    const page = this.page();
    const hover = this.hover();
    if (!page?.bounds || page.kind === 'continent' || !hover) {
      return;
    }
    const { x, y } = fromGameMap(page.bounds, hover.point);
    const command =
      page.kind === 'zone'
        ? `.go zonexy ${(hover.point.u * 100).toFixed(1)} ${(hover.point.v * 100).toFixed(1)} ${page.areaId}`
        : `.go xyz ${x.toFixed(1)} ${y.toFixed(1)} ${this.heightOn(page).toFixed(1)} ${page.mapId}`;
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

  /** A click on a neighbour's chip opens it. */
  protected openLabel(label: GameLabel, event: Event): void {
    event.stopPropagation();
    this.open(label.key);
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

  protected iconOf(icon: GameMapIcon | undefined): string | undefined {
    return icon?.path ? this.icons().get(iconKey(icon)) : undefined;
  }

  protected sideIcon(side: Side): string | undefined {
    return this.icons().get(iconKey(atlasIcon(side === 'alliance' ? ATLAS.allianceCrest : ATLAS.hordeCrest)));
  }

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
    this.setShown(shown);
  }

  protected groupCount(group: GameMapLayerGroup): number {
    return group.layers.filter((layer) => this.shown().has(layer.key)).length;
  }

  /** Every marker on or off (the map's own options as they are). */
  protected setAll(on: boolean): void {
    const shown = new Set([...this.shown()].filter((key) => GAME_MAP_OPTIONS.some((option) => option.key === key)));
    if (on) {
      GAME_MAP_LAYER_GROUPS.forEach((group) => group.layers.forEach((layer) => shown.add(layer.key)));
    }
    this.setShown(shown);
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

  /** The outlines a page needs: its regions'; on a zone its sub-zones', its continent's zones' and its neighbours'. */
  private loadOutlinesOf(page: GamePage, overlays: GameMapOverlay[], continent: GamePage | undefined): void {
    if (page.regions.length) {
      void this.loadOutlines(`regions:${page.key}`, () => this.client.getGameMapOutlines(page));
    }
    if (page.kind === 'zone') {
      void this.loadOutlines(`subzones:${page.key}`, () => this.client.getGameMapSubzones(page, overlays));
      if (continent) {
        void this.loadOutlines(`regions:${continent.key}`, () => this.client.getGameMapOutlines(continent));
        void this.loadOutlines(`neighbours:${page.key}`, () => this.client.getGameMapNeighbours(page, continent, overlays));
      }
    }
  }

  /** Outlines, asked once each (none when they can't be traced). */
  private async loadOutlines(key: string, trace: () => Promise<Map<string, Ring[]>>): Promise<void> {
    if (this.outlines().has(key)) {
      return;
    }
    this.outlines.update((map) => new Map(map).set(key, new Map()));
    const started = performance.now();
    const outlines = await trace().catch((error: Error) => {
      console.warn(`[World Editor] Could not trace the world map's ${key}:`, error);
      return new Map<string, Ring[]>();
    });
    perfNote(`game map: ${key}, ${outlines.size} outlines after ${Math.round(performance.now() - started)} ms`);
    this.outlines.update((map) => new Map(map).set(key, outlines));
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

  /** The layers' icons, the atlas's cells cut out. */
  private async loadIcons(): Promise<void> {
    const icons = GAME_MAP_LAYERS.map((layer) => layer.icon as GameMapIcon).filter((icon) => icon?.path && icon.atlas === undefined);
    for (const icon of icons) {
      const image = await this.client.getTexture(icon.path as string).catch(() => undefined);
      if (image) {
        const part = icon.crop ? cropImage(image, ...icon.crop) : image;
        this.icons.update((map) => new Map(map).set(iconKey(icon), imageToPngUrl(part)));
      }
    }
    const atlas = await this.client.getTexture(POI_ATLAS).catch(() => undefined);
    if (atlas) {
      const cells = new Map<string, string>();
      for (const cell of ATLAS_CELLS) {
        const [x, y] = [(cell % POI_ATLAS_COLUMNS) * POI_ATLAS_PITCH + 1, Math.floor(cell / POI_ATLAS_COLUMNS) * POI_ATLAS_PITCH + 1];
        cells.set(iconKey(atlasIcon(cell)), imageToPngUrl(cropImage(atlas, x, y, POI_ATLAS_CELL, POI_ATLAS_CELL)));
      }
      this.icons.update((map) => new Map([...map, ...cells]));
    }
  }
}
