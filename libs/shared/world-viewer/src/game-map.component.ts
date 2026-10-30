import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, output, signal, untracked } from '@angular/core';
import {
  AREA_CAPITAL,
  AREA_SANCTUARY,
  AreaTriggerInfo,
  COSMIC_PAGE,
  cropImage,
  edgeButton,
  FactionData,
  firstPage,
  fromGameMap,
  GameMapData,
  GameMapOverlay,
  GameMapPicture,
  GameMapPoint,
  GameMapRect,
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
  TaxiPathNode,
  TILE_SIZE,
  TileCoord,
  tileKey,
  tileOrigin,
  toGameMap,
  worldToTile,
  WorldBounds,
  WorldPosition,
  WowClientService,
  WORLD_PAGE,
  WowMap,
} from '@keira/shared/wow-data';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { cssRgb, LEVEL_BANDS, levelColor, territoryColor } from './game-map-layers';
import {
  BADGE_ICONS,
  CONTINENT_LAYERS,
  factionSide,
  friendlySides,
  GAME_MAP_LAYER_GROUPS,
  GAME_MAP_LAYERS,
  GAME_MAP_OPTIONS,
  GameMapIcon,
  GameMapLayer,
  GameMapLayerGroup,
  GameMapPoi,
  GameMapPortal,
  GameMapSpawnLevel,
  GameMapTeleport,
  GameMapTransport,
  loadMarkerSize,
  loadShownLayers,
  MARKER_SIZES,
  NO_BADGE,
  POI_ASSETS,
  saveMarkerSize,
  saveShownLayers,
  subzoneLevels,
  TERRITORY_ICONS,
  transportKind,
  TRAVEL_ICONS,
} from './game-map-pois';
import {
  describeTransport,
  legTime,
  roundTrip,
  routeArrows,
  routeLabel,
  routeLines,
  routeNearest,
  RoutePoint,
  RouteStop,
  routeStops,
} from './game-map-routes';
import { imageToDataUrl, imageToPngUrl } from './minimap-image';
import { WorldMapDot } from './world-map.component';

/** At most this many spawn dots are drawn. */
const MAX_DOTS = 3000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
/**
 * The seamless map (like the OpenMap addon): how deep it zooms (minimaps about full size), the width on screen (px)
 * zone pictures show from (fully at twice it), the size of a minimap tile they show from (fully at twice it), and the
 * zoom from which every marker shows (not only travel and instances).
 */
const SEAMLESS_MAX_ZOOM = 48;
const ZONE_FADE = 180;
const TILE_FADE = 64;
const SEAMLESS_ALL_MARKERS = 4;
/** At most this many minimap tiles are drawn at once. */
const MAX_TILES = 120;
/** The spawns of the area shown can be loaded from this zoom on, in the seamless map. */
const SEAMLESS_LOAD_ZOOM = 6;
/** Each game map's own ids (its zones' clip paths). */
let gameMapCount = 0;
/** A press moving less than this (pixels) is a click. */
const CLICK_SLOP = 4;
/** The continents (Map.dbc), as AoWoW's menu lists them; and the maps a `.go zonexy` works on. */
const CONTINENT_ORDER = [0, 1, 530, 571];
/** Instance types (Map.dbc) of battlegrounds. */
const INSTANCE_BATTLEGROUND = 3;
/** The expansion badges after a map's name (none for Classic). */
const EXPANSION_ICONS = ['', `${POI_ASSETS}exp-bc.gif`, `${POI_ASSETS}exp-wotlk.gif`];
/** How long the note of a copied `.go` command stays. */
const TOAST_MS = 2200;
/** Zones whose outlines on their continent come this close (percent) are neighbours. */
const NEIGHBOUR_TOUCH = 1;
/** Markers of one kind (and side) closer than this (percent of the map, each way) are shown as one. */
const MERGE_DISTANCE = 0.8;
/** Wintergrasp (AreaTable), marked for its world PvP on Northrend. */
const WINTERGRASP = 4197;
/** Instance types (Map.dbc) of dungeons and raids. */
const INSTANCE_DUNGEON = 1;
const INSTANCE_RAID = 2;
/** The picture's size (pixels) routes' arrows are spaced and turned in (its shape is what counts). */
const FRAME_W = 1002;
const FRAME_H = 668;
/** A route is under the pointer this close to it (pixels of that frame). */
const ROUTE_HOVER = 6;

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
  /** The side it serves (markers of one kind are only shown as one with those of the same side). */
  side?: Side;
  /** The sides that may use it (small badges above it). */
  badges?: Side[];
  /** An instance's entrance (or a zone's shield, a portal) opens its map. */
  opens?: string;
  position: WorldPosition;
  mapId: number;
  /** Its layer, when markers of it nearby can be shown as one; how many more are there then. */
  kind?: string;
  more?: number;
}

/** A transport's route on the picture (as AoWoW's): its lines, arrows, number and stops, and what it says. */
interface GameRoute {
  key: string;
  entry: number;
  /** Its side's colour: a(lliance), h(orde), n(eutral). */
  side: 'a' | 'h' | 'n';
  /** Its lines as SVG path data (percent), and as points. */
  d: string;
  lines: RoutePoint[][];
  arrows: { u: number; v: number; angle: number }[];
  label?: { u: number; v: number; angle: number };
  /** Where it waits: a bar across the line, the wait beside it (pixels off the line). */
  stops: { u: number; v: number; angle: number; text: string; dx: number; dy: number }[];
  title: string;
  kind: string;
  route?: string;
  times: string[];
}

/** A shape drawn over the picture: a zone (coloured by level or land), a neighbour, or a sub-zone. */
interface GameShape {
  /** The page it opens (a zone, a continent…), or a sub-zone's area id. */
  key: string;
  d: string;
  kind: 'zone' | 'plain' | 'neighbour' | 'sub' | 'sub link';
  color?: string;
}

/**
 * A chip on a zone's picture naming a neighbouring zone (with its levels) that opens it: on the part of it the picture
 * shows, or (none shown) at the edge facing it, `edge` being that edge; or a city inside the zone that has a map.
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

/** An icon's key among the loaded pictures. */
export const iconKey = (icon: GameMapIcon): string => (icon.crop ? `${icon.path}@${icon.crop.join(',')}` : (icon.path as string));

/** A menu of maps (a continent's zones, the raids…), in columns (by expansion for instances). */
interface GameMapMenu {
  key: string;
  label: string;
  columns: { key: string; name: string; exp: string }[][];
}

/** The shape under a point of the picture, by its key. */
function shapeAt(shapes: Map<string, Ring[]>, point: GameMapPoint): string | undefined {
  for (const [key, rings] of shapes) {
    if (pointInRings(point.u * 100, point.v * 100, rings)) {
      return key;
    }
  }
  return undefined;
}

/**
 * Markers of one kind (and side, opening the same map) on top of each other shown as one, with how many more there are
 * (on copies: the markers may be kept by other computations).
 */
function mergePins(pins: GamePin[], distance: number): GamePin[] {
  const merged: GamePin[] = [];
  for (const pin of pins) {
    const near =
      pin.kind &&
      merged.find(
        (other) =>
          other.kind === pin.kind &&
          other.side === pin.side &&
          other.opens === pin.opens &&
          Math.abs(other.u - pin.u) * 100 <= distance &&
          Math.abs(other.v - pin.v) * 100 <= distance,
      );
    if (near) {
      near.more = (near.more ?? 0) + 1;
    } else {
      merged.push({ ...pin });
    }
  }
  return merged;
}

/**
 * The in-game world map, made at run time from the user's own client (pictures and DBCs; nothing of the client ships
 * with Keira), like AoWoW's maps: the cosmic map, the world map, the continents, their zones and the floors of
 * instances. Zones are outlined as AoWoW traces them (from the client's highlights), coloured by level or faction; the
 * zone under the pointer lights up and a click opens it, neighbouring zones too (dotted, with a chip naming them).
 * Sub-zones are outlined and named (cities inside a zone open their map), with the game's coordinates. The wheel zooms
 * and dragging pans. Markers (townsfolk, professions, vendors, travel, instance entrances, and the 3D view's spawns when
 * asked) use AoWoW's icons (the client's where they are the client's), with badges for the sides that may use them.
 * A right click (or Alt + click) copies a `.go` command for the place.
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
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
  /** Portal objects (Shattrath's, Dalaran's…) with where they send to. */
  readonly portals = input<GameMapPortal[]>([]);
  readonly maps = input<WowMap[]>([]);
  /** Reads the creatures spawned in an area of a map, for the levels of a zone's sub-zones (none: no levels). */
  readonly spawnLevels = input<((mapId: number, bounds: WorldBounds) => Promise<GameMapSpawnLevel[]>) | undefined>(undefined);
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
   * its neighbours it shows (`neighbours:<page>`); none while being traced.
   */
  private readonly outlines = signal(new Map<string, Map<string, Ring[]>>());
  /** The outlines asked for. */
  private readonly outlinesAsked = new Set<string>();
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
  /** The note by the pointer after a right click: the `.go` command copied, or why there is none. */
  protected readonly toast = signal<{ x: number; y: number; text: string; error: boolean } | undefined>(undefined);
  private toastTimer?: ReturnType<typeof setTimeout>;
  /** The menu of maps open (by key). */
  protected readonly openMenu = signal<string | undefined>(undefined);
  /**
   * The seamless map (like the OpenMap addon): a continent whose zones' pictures, then their cities', then the
   * minimaps of the ground fade in as it is zoomed into, with every marker once close enough.
   */
  protected readonly seamless = signal(false);
  /** The viewport's size (px), as last measured. */
  private readonly viewportSize = signal({ width: 0, height: 0 }, { equal: (a, b) => a.width === b.width && a.height === b.height });
  /** Minimap tiles as pictures (null: none there), by directory and tile. */
  private readonly tileImages = signal(new Map<string, string | null>());
  private readonly tilesAsked = new Set<string>();
  private readonly uid = `game-map-${++gameMapCount}`;
  /** The icons (and crests) as pictures, by `iconKey`. */
  protected readonly icons = signal(new Map<string, string>());
  private readonly factions = signal<FactionData | undefined>(undefined);
  private readonly triggers = signal(new Map<number, AreaTriggerInfo[]>());
  /** The creatures spawned on zones' pictures (for their sub-zones' levels), by page. */
  private readonly pageSpawns = signal(new Map<string, GameMapSpawnLevel[]>());
  /** The transports' paths (every map), by taxi path. */
  private readonly transportNodes = signal(new Map<number, TaxiPathNode[]>());
  private transportNodesAsked = false;
  private press?: { x: number; y: number; pan: { x: number; y: number }; moved: boolean };

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

  /** AoWoW's menus of maps: each continent's zones, then the raids, dungeons and battlegrounds by expansion. */
  protected readonly menus = computed<GameMapMenu[]>(() => {
    const pages = this.pages();
    const maps = new Map(this.maps().map((m) => [m.id, m]));
    const item = (page: GamePage) => ({
      key: page.key,
      name: this.pageName({ ...page, floor: undefined }),
      exp: EXPANSION_ICONS[maps.get(page.mapId)?.expansion ?? 0],
    });
    const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
    const menus: GameMapMenu[] = [];
    for (const mapId of CONTINENT_ORDER) {
      const continent = [...pages.values()].find((p) => p.kind === 'continent' && p.mapId === mapId);
      if (continent) {
        const zones = continent.regions
          .map((region) => firstPage(pages, region.page))
          .filter((page): page is GamePage => !!page)
          .map(item)
          .sort(byName);
        menus.push({ key: continent.key, label: this.pageName(continent), columns: [zones] });
      }
    }
    const instances: [string, number][] = [
      ['RAIDS', INSTANCE_RAID],
      ['DUNGEONS', INSTANCE_DUNGEON],
      ['BATTLEGROUNDS', INSTANCE_BATTLEGROUND],
    ];
    for (const [key, type] of instances) {
      const areas = new Map<number, GamePage>();
      for (const page of pages.values()) {
        const map = maps.get(page.mapId);
        if ((page.kind === 'zone' || page.kind === 'floor') && map?.instanceType === type && !areas.has(page.mapAreaId)) {
          areas.set(page.mapAreaId, firstPage(pages, `area:${page.mapAreaId}`) as GamePage);
        }
      }
      const columns = [0, 1, 2]
        .map((exp) =>
          [...areas.values()]
            .filter((page) => (maps.get(page.mapId)?.expansion ?? 0) === exp)
            .map(item)
            .sort(byName),
        )
        .filter((column) => column.length);
      if (columns.length) {
        menus.push({ key, label: this.translate.instant(`WORLD_EDITOR.GAME_MAP_MENU_${key}`), columns });
      }
    }
    return menus;
  });

  /** The expansion badge after the name of the map shown. */
  protected readonly titleExpansion = computed(() => {
    const page = this.page();
    return (page && EXPANSION_ICONS[this.maps().find((m) => m.id === page.mapId)?.expansion ?? 0]) || '';
  });

  /** AoWoW's round frame around square (spell / item) icons. */
  protected readonly spellBorder = `${POI_ASSETS}spell-border.png`;
  protected readonly cosmicPage = COSMIC_PAGE;
  protected readonly worldPage = WORLD_PAGE;

  protected toggleMenu(key: string): void {
    this.openMenu.set(this.openMenu() === key ? undefined : key);
    // (kept on the screen: opening to the left when it would go past the window's right edge)
    setTimeout(() => {
      const drop = this.host.nativeElement.querySelector<HTMLElement>('.game-map-nav-drop');
      if (drop && drop.getBoundingClientRect().right > window.innerWidth) {
        drop.style.left = 'auto';
        drop.style.right = '0';
      }
    });
  }

  /** The page "back" goes to. */
  protected readonly parentPage = computed(() => {
    const parent = this.page()?.parent;
    return parent ? this.pages().get(parent) : undefined;
  });

  /** The overlays of the zone shown (its sub-zones). */
  private readonly overlays = computed(() => {
    const page = this.page();
    return page?.kind === 'zone' ? this.overlaysOf(page) : [];
  });

  private overlaysOf(page: GamePage): GameMapOverlay[] {
    return (this.data() as GameMapData).overlays.filter((o) => o.mapAreaId === page.mapAreaId);
  }

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

  /** The levels of the zone's sub-zones, from the creatures spawned in them (as AoWoW's), by area id. */
  private readonly subLevels = computed(() => {
    const page = this.page() as GamePage;
    // (asked for when the zone opened)
    const spawns = this.pageSpawns().get(page.key) as GameMapSpawnLevel[];
    const templates = this.factions()?.templates;
    const continent = this.continent();
    const own = continent && this.outlines().get(`regions:${continent.key}`)?.get(page.key);
    return subzoneLevels(
      spawns,
      this.subzones(),
      (spawn) => {
        const point = toGameMap(page.bounds as WorldBounds, spawn.x, spawn.y);
        return [point.u * 100, point.v * 100];
      },
      // (the zone's picture shows its neighbours too: only what is in the zone itself)
      (spawn) => {
        const point = own && this.placeOn(continent as GamePage, page.mapId, spawn);
        return !point || pointInRings(point.u * 100, point.v * 100, own);
      },
      (faction) => {
        const template = templates?.get(faction);
        return !!template && ((template.ourMask | template.friendMask) & 7) !== 0;
      },
      pointInRings,
    );
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
    () => this.page()?.kind === 'continent' && !this.seamlessOn() && (this.shown().has('levels') || this.shown().has('territory')),
  );

  // ------------------------------------------------------------------ the seamless map

  /** Whether the seamless map is shown (it is a continent's). */
  protected readonly seamlessOn = computed(() => this.seamless() && this.page()?.kind === 'continent');

  /** The stage's size on screen (px). */
  private readonly stageSize = computed(() => {
    const { width, height } = this.viewportSize();
    const stage = Math.min(width, (height * FRAME_W) / FRAME_H) * this.zoom();
    return { width: stage, height: (stage * FRAME_H) / FRAME_W };
  });

  /** The part of the picture on screen (fractions of it; all of it until the viewport is measured). */
  private readonly visibleBox = computed<GameMapRect>(() => {
    const { width, height } = this.viewportSize();
    const stage = this.stageSize();
    const pan = this.pan();
    if (!stage.width) {
      return { left: 0, top: 0, right: 1, bottom: 1 };
    }
    return {
      left: 0.5 + (-width / 2 - pan.x) / stage.width,
      right: 0.5 + (width / 2 - pan.x) / stage.width,
      top: 0.5 + (-height / 2 - pan.y) / stage.height,
      bottom: 0.5 + (height / 2 - pan.y) / stage.height,
    };
  });

  /**
   * The zones' pictures on the seamless map: those on screen and big enough, where they are on the continent, clipped
   * to their outline there and fading in as they grow; the big ones first (cities on top of their zone).
   */
  protected readonly seamlessZones = computed(() => {
    const page = this.page() as GamePage;
    if (!this.seamlessOn()) {
      return [];
    }
    const width = this.stageSize().width;
    const box = this.visibleBox();
    const pictures = this.pictures();
    const outlines = this.regions();
    const zones: {
      key: string;
      page: GamePage;
      x: number;
      y: number;
      width: number;
      height: number;
      d: string;
      clip: string;
      alpha: number;
      area: number;
      url?: string;
    }[] = [];
    for (const region of page.regions) {
      const target = this.targetOf(region.page);
      const rings = outlines.get(region.page);
      const { left, top, right, bottom } = region.rect;
      const alpha = Math.min(1, ((right - left) * width - ZONE_FADE) / ZONE_FADE);
      if (!target || !rings || alpha <= 0 || right < box.left || left > box.right || bottom < box.top || top > box.bottom) {
        continue;
      }
      const picture = pictures.get(target.prefix);
      zones.push({
        key: region.page,
        page: target,
        x: left * 100,
        y: top * 100,
        width: (right - left) * 100,
        height: (bottom - top) * 100,
        d: ringsPath(rings),
        clip: `${this.uid}-clip-${zones.length}`,
        alpha,
        area: (right - left) * (bottom - top),
        url: picture && picture !== 'loading' ? picture.url : undefined,
      });
    }
    return zones.sort((a, b) => b.area - a.area);
  });

  /**
   * Where the ground's minimaps come from on the seamless map: the continent's own map (but the parts drawn on another
   * continent), and the parts of other maps drawn on it (Eversong Woods on the Eastern Kingdoms); none until they are
   * big enough to show.
   */
  private readonly tileSources = computed(() => {
    const page = this.page() as GamePage;
    if (!this.seamlessOn()) {
      return [];
    }
    const bounds = page.bounds as WorldBounds;
    if ((TILE_SIZE / (bounds.maxY - bounds.minY)) * this.stageSize().width <= TILE_FADE) {
      return [];
    }
    const maps = this.maps();
    const directory = (mapId: number) => maps.find((m) => m.id === mapId)?.directory;
    const transforms = (this.data() as GameMapData).transforms;
    return [
      {
        directory: directory(page.mapId),
        offsetX: 0,
        offsetY: 0,
        region: undefined as WorldBounds | undefined,
        // (nor where another map's part is drawn: the Eastern Kingdoms' own map has empty sea under Eversong Woods)
        away: [
          ...transforms.filter((t) => t.mapId === page.mapId).map((t) => t.region),
          ...transforms
            .filter((t) => t.newMapId === page.mapId)
            .map((t) => ({
              minX: t.region.minX + t.offsetX,
              maxX: t.region.maxX + t.offsetX,
              minY: t.region.minY + t.offsetY,
              maxY: t.region.maxY + t.offsetY,
            })),
        ],
      },
      ...transforms
        .filter((t) => t.newMapId === page.mapId)
        .map((t) => ({ directory: directory(t.mapId), offsetX: t.offsetX, offsetY: t.offsetY, region: t.region, away: [] })),
    ].filter((source): source is typeof source & { directory: string } => !!source.directory);
  });

  /** The minimap tiles on screen on the seamless map (the nearest to the middle first), fading in as they grow. */
  protected readonly seamlessTiles = computed(() => {
    const sources = this.tileSources();
    if (!sources.length) {
      return [];
    }
    const bounds = (this.page() as GamePage).bounds as WorldBounds;
    const [du, dv] = [TILE_SIZE / (bounds.maxY - bounds.minY), TILE_SIZE / (bounds.maxX - bounds.minX)];
    const alpha = Math.min(1, (du * this.stageSize().width - TILE_FADE) / TILE_FADE);
    const box = this.visibleBox();
    const [left, top, right, bottom] = [Math.max(0, box.left), Math.max(0, box.top), Math.min(1, box.right), Math.min(1, box.bottom)];
    const [cu, cv] = [(left + right) / 2, (top + bottom) / 2];
    const images = this.tileImages();
    const inside = (r: WorldBounds, x: number, y: number) => Math.min(x - r.minX, r.maxX - x, y - r.minY, r.maxY - y) >= 0;
    const tiles: {
      key: string;
      directory: string;
      tile: TileCoord;
      x: number;
      y: number;
      width: number;
      height: number;
      alpha: number;
      distance: number;
      url?: string | null;
    }[] = [];
    for (const source of sources) {
      const a = fromGameMap(bounds, { u: left, v: top });
      const b = fromGameMap(bounds, { u: right, v: bottom });
      const from = worldToTile(a.x - source.offsetX, a.y - source.offsetY);
      const to = worldToTile(b.x - source.offsetX, b.y - source.offsetY);
      for (let tx = from.tx; tx <= to.tx; tx++) {
        for (let ty = from.ty; ty <= to.ty; ty++) {
          const origin = tileOrigin({ tx, ty });
          const [mx, my] = [origin.x - TILE_SIZE / 2, origin.y - TILE_SIZE / 2];
          if ((source.region && !inside(source.region, mx, my)) || source.away.some((r) => inside(r, mx, my))) {
            continue;
          }
          const { u, v } = toGameMap(bounds, origin.x + source.offsetX, origin.y + source.offsetY);
          const key = `${source.directory}:${tileKey({ tx, ty })}`;
          tiles.push({
            key,
            directory: source.directory,
            tile: { tx, ty },
            x: u * 100,
            y: v * 100,
            width: du * 100,
            height: dv * 100,
            alpha,
            distance: Math.hypot(u + du / 2 - cu, v + dv / 2 - cv),
            url: images.get(key),
          });
        }
      }
    }
    return tiles.sort((x, y) => x.distance - y.distance).slice(0, MAX_TILES);
  });

  /** Whether a zone's picture is fully shown on the seamless map (a click on it then doesn't zoom). */
  private zoneShown(key: string): boolean {
    return this.seamlessZones().some((zone) => zone.key === key && zone.alpha === 1);
  }

  /** Whether a place of the picture is on screen (always, but on the seamless map). */
  private inView(point: GameMapPoint): boolean {
    const box = this.visibleBox();
    return !this.seamlessOn() || (point.u >= box.left && point.u <= box.right && point.v >= box.top && point.v <= box.bottom);
  }

  /** Measures the viewport (the seamless map shows what is on screen). */
  private measure(): { width: number; height: number } {
    const rect = (this.host.nativeElement.querySelector('.game-map-viewport') as HTMLElement).getBoundingClientRect();
    const size = { width: rect.width, height: rect.height };
    this.viewportSize.set(size);
    return size;
  }

  /** How deep the map zooms. */
  private maxZoom(): number {
    return this.seamlessOn() ? SEAMLESS_MAX_ZOOM : MAX_ZOOM;
  }

  /** Shows the seamless map, or the pages again: from a zone, its continent zoomed to it. */
  /**
   * Switches between the seamless map and the pages, keeping what is on screen: a zone's page becomes its continent
   * zoomed to the same place, and the seamless map the page of the zone in the middle of the screen (when it is big
   * enough to have been shown), as deep as pages zoom.
   */
  protected toggleSeamless(): void {
    const on = !this.seamless();
    this.measure();
    const centre = this.viewCentre();
    const zoom = this.zoom();
    // (the switch shows once a page is)
    const page = this.page() as GamePage;
    if (on) {
      this.seamless.set(true);
      const found = page.kind === 'zone' ? this.seamlessTarget(page.key) : undefined;
      if (found) {
        const r = found.region.rect;
        this.show(found.continent.key);
        this.setView(zoom / (r.right - r.left), r.left + centre.u * (r.right - r.left), r.top + centre.v * (r.bottom - r.top));
      }
      return;
    }
    const zone = this.seamlessOn() ? this.zoneAt(centre) : undefined;
    const region = zone && page.regions.find((r) => this.targetOf(r.page) === zone.target);
    const zoneZoom = region ? zoom * (region.rect.right - region.rect.left) : 0;
    this.seamless.set(false);
    if (zone && zoneZoom >= MIN_ZOOM) {
      this.show(zone.target.key);
      this.setView(zoneZoom, zone.u, zone.v);
    } else {
      this.setView(zoom, centre.u, centre.v);
    }
  }

  /** The place of the picture in the middle of the screen. */
  private viewCentre(): GameMapPoint {
    const stage = this.stageSize();
    const pan = this.pan();
    return stage.width ? { u: 0.5 - pan.x / stage.width, v: 0.5 - pan.y / stage.height } : { u: 0.5, v: 0.5 };
  }

  /** Shows a place of the picture in the middle of the screen, at a zoom (within the page's). */
  private setView(zoom: number, u: number, v: number): void {
    const { width, height } = this.viewportSize();
    const fit = Math.min(this.maxZoom(), Math.max(MIN_ZOOM, zoom));
    const stage = Math.min(width, (height * FRAME_W) / FRAME_H) * fit;
    this.zoom.set(fit);
    this.pan.set(fit === MIN_ZOOM ? { x: 0, y: 0 } : { x: -(u - 0.5) * stage, y: -(v - 0.5) * ((stage * FRAME_H) / FRAME_W) });
  }

  /** The continent a page is a zone of, with where it is there (for the seamless map). */
  private seamlessTarget(key: string): { continent: GamePage; region: GameMapRegion } | undefined {
    const target = this.targetOf(key);
    for (const page of this.pages().values()) {
      const region = target && page.kind === 'continent' ? page.regions.find((r) => this.targetOf(r.page) === target) : undefined;
      if (region) {
        return { continent: page, region };
      }
    }
    return undefined;
  }

  /** Zooms to fit a part of the picture on screen. */
  private zoomToRect(rect: GameMapRect): void {
    const { width, height } = this.measure();
    const base = Math.min(width, (height * FRAME_W) / FRAME_H);
    if (!base) {
      return;
    }
    const fit = Math.min(width / ((rect.right - rect.left) * base), (height * FRAME_W) / ((rect.bottom - rect.top) * base * FRAME_H));
    const zoom = Math.min(this.maxZoom(), Math.max(MIN_ZOOM, fit * 0.9));
    const stage = base * zoom;
    this.zoom.set(zoom);
    this.pan.set({
      x: -((rect.left + rect.right) / 2 - 0.5) * stage,
      y: -((rect.top + rect.bottom) / 2 - 0.5) * ((stage * FRAME_H) / FRAME_W),
    });
  }

  /** The sub-zones of the zone shown that have a map of their own (cities: Stormwind in Elwynn Forest), by area id. */
  private readonly subLinks = computed(() => {
    const page = this.page();
    const links = new Map<string, GamePage>();
    this.subzones().forEach((_, key) => {
      const target = [...this.pages().values()].find((p) => p.areaId === Number(key) && p.mapAreaId !== (page as GamePage).mapAreaId);
      if (target) {
        links.set(key, target);
      }
    });
    return links;
  });

  /** Sub-zones (faint lines when asked), those with a map of their own like neighbours (always: they open it). */
  protected readonly subPaths = computed<GameShape[]>(() =>
    [...this.subzones()]
      .filter(([key]) => this.shown().has('subBorders') || this.subLinks().has(key))
      .map(([key, rings]) => ({ key, d: ringsPath(rings), kind: this.subLinks().has(key) ? ('sub link' as const) : ('sub' as const) })),
  );

  /** Whether zone borders are drawn (on continents, the world map). */
  protected readonly borders = computed(() => this.shown().has('borders'));

  /** The region under the pointer (a zone, a continent, a world; a neighbour on a zone), by the page it opens. */
  protected readonly hoverKey = computed(() => {
    const hover = this.hover();
    // (neighbours too when their outlines are hidden, as on AoWoW's)
    return hover && this.page() ? shapeAt(this.regions(), hover.point) : undefined;
  });

  /** The page the region (or city) under the pointer opens. */
  protected readonly hoverTarget = computed(() => {
    const key = this.hoverKey();
    const sub = this.hoverSub();
    return key ? this.targetOf(key) : sub ? this.subLinks().get(sub) : undefined;
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
    this.subLinks().forEach((target, key) => {
      const [x, y] = labelPoint(this.subzones().get(key) as Ring[]);
      placed.push(this.chip(target, x, y, placed));
    });
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
    const u = clamp(x, w);
    const free = (v: number) => placed.every((p) => Math.abs(p.u * 100 - u) >= (p.w + w) / 2 || Math.abs(p.v * 100 - v) >= (p.h + h) / 2);
    // (where it is, when there's no free place near)
    const [v] = [...[0, 1, -1, 2, -2, 3, -3].map((k) => clamp(y + k * h, h)).filter(free), clamp(y, h)];
    return { key: target.key, u: u / 100, v: v / 100, text, levels: levelText, w, h };
  }

  /**
   * What the tooltip says: the zone a click opens, its levels and land; or (on a zone) the sub-zone under the pointer;
   * with the map's, zone's and area's ids at the bottom.
   */
  protected readonly tooltip = computed(() => {
    const hover = this.hover();
    const page = this.page();
    if (!hover || !page || this.hoverPin()) {
      return undefined;
    }
    const route = this.hoverRoute();
    if (route) {
      return {
        x: hover.x,
        y: hover.y,
        title: route.title,
        levels: route.kind,
        land: route.route,
        hint: this.translate.instant('WORLD_EDITOR.GAME_MAP_ARROWS'),
        ids: route.times,
      };
    }
    const target = this.hoverTarget();
    const sub = this.hoverSub();
    if (target) {
      const levels = this.levelsOf(target);
      const city = !this.hoverKey();
      const opens = !this.seamlessOn()
        ? 'WORLD_EDITOR.GAME_MAP_CLICK_OPENS'
        : this.zoneShown(target.key)
          ? ''
          : 'WORLD_EDITOR.GAME_MAP_CLICK_ZOOMS';
      return {
        x: hover.x,
        y: hover.y,
        title: this.pageName(target),
        levels: this.levelLine(target, levels),
        land: this.landText(target),
        hint: city
          ? `${this.areaName(page.areaId)} · ${this.translate.instant(opens)}`
          : page.kind === 'zone'
            ? this.translate.instant('WORLD_EDITOR.GAME_MAP_OTHER_AREA')
            : opens && this.translate.instant(opens),
        ids: this.ids(target.mapId, target.areaId),
      };
    }
    if (!page.bounds || page.kind === 'continent' || (!sub && page.kind === 'zone')) {
      return undefined;
    }
    const area = this.areaName(sub ? Number(sub) : page.areaId);
    const levels = sub ? this.subLevels().get(sub) : undefined;
    const city = ((this.data() as GameMapData).zones.get(Number(sub))?.flags ?? 0) & AREA_CAPITAL;
    return {
      x: hover.x,
      y: hover.y,
      title: area,
      levels:
        sub && city
          ? this.translate.instant('WORLD_EDITOR.GAME_MAP_CITY')
          : levels && this.translate.instant('WORLD_EDITOR.GAME_MAP_LEVELS', { min: levels[0], max: levels[1] }),
      land: undefined,
      hint: this.areaName(page.areaId),
      ids: this.ids(page.mapId, page.areaId, sub ? Number(sub) : 0),
    };
  });

  /** "Map ID: …", "Zone ID: …", "Area ID: …" (one a line; none for what isn't known). */
  private ids(mapId: number, zoneId: number, areaId = 0): string[] {
    return [
      mapId >= 0 ? this.translate.instant('WORLD_EDITOR.GAME_MAP_MAP_ID', { id: mapId }) : '',
      zoneId ? this.translate.instant('WORLD_EDITOR.GAME_MAP_ZONE_ID', { id: zoneId }) : '',
      areaId ? this.translate.instant('WORLD_EDITOR.GAME_MAP_AREA_ID', { id: areaId }) : '',
    ].filter(Boolean);
  }

  /** The game's coordinates of the place under the pointer (zones and floors). */
  protected readonly coordinates = computed(() => {
    const hover = this.hover();
    const page = this.page();
    const zone = hover && this.seamlessOn() ? this.zoneAt(hover.point) : undefined;
    if (zone) {
      return `${this.areaName(zone.target.areaId)} ${(zone.u * 100).toFixed(1)}, ${(zone.v * 100).toFixed(1)}`;
    }
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
        if (point && this.inView(point) && pins.length < MAX_DOTS) {
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
          badges: NO_BADGE.has(poi.kind) ? [] : this.badgesOf(friendlySides(factions?.templates.get(poi.faction ?? 0))),
          position: poi,
          mapId: poi.mapId,
          kind: poi.kind,
        });
      }
    });
    pins.push(
      ...this.transportPins(),
      ...this.entrances().filter((pin) => this.showsLayer(pin.key.split(':')[1]) && this.belongs(page, pin.mapId, pin.position)),
      ...(this.showsLayer('portal') ? this.portalPins() : []),
      ...this.territoryPins().filter((pin) => shown.has(pin.kind as string)),
    );
    // (on the seamless map, markers merge as close on screen as on a page)
    const seamless = this.seamlessOn();
    return mergePins(seamless ? pins.filter((pin) => this.inView(pin)) : pins, MERGE_DISTANCE / (seamless ? this.zoom() : 1));
  });

  /** The sides of these that badges are shown for. */
  private badgesOf(sides: { alliance: boolean; horde: boolean }): Side[] {
    return (['alliance', 'horde'] as Side[]).filter((side) => sides[side]);
  }

  /** Whether a layer's markers are shown on the page (on continents only some layers are). */
  private showsLayer(key: string): boolean {
    return (
      this.shown().has(key) &&
      (this.page()?.kind !== 'continent' || CONTINENT_LAYERS.has(key) || (this.seamlessOn() && this.zoom() >= SEAMLESS_ALL_MARKERS))
    );
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
    const zones = continent && this.outlines().get(`regions:${continent.key}`);
    if (continent && !zones) {
      // (not until the zone's outline is known: not shown, then hidden)
      return false;
    }
    const own = zones?.get(page.key);
    const point = own && this.placeOn(continent as GamePage, mapId, place);
    return !point || pointInRings(point.u * 100, point.v * 100, own);
  }

  /**
   * On a continent, a shield on each zone of a side (whose land it is; not its capital cities, which lie in such a zone)
   * and swords on Wintergrasp (its world PvP).
   */
  private readonly territoryPins = computed<GamePin[]>(() => {
    const page = this.page() as GamePage;
    const outlines = page.kind === 'continent' ? this.outlines().get(`regions:${page.key}`) : undefined;
    const pins: GamePin[] = [];
    outlines?.forEach((rings, key) => {
      const target = this.targetOf(key);
      const zone = target && (this.data() as GameMapData).zones.get(target.areaId);
      const side =
        zone && !(zone.flags & AREA_CAPITAL) ? (zone.faction === 1 ? 'alliance' : zone.faction === 0 ? 'horde' : undefined) : undefined;
      const kind = target?.areaId === WINTERGRASP ? 'pvp' : side ? 'relations' : undefined;
      if (!target || !kind) {
        return;
      }
      const [x, y] = labelPoint(rings);
      const point = { u: x / 100, v: y / 100 };
      const icon =
        kind === 'pvp'
          ? ((GAME_MAP_LAYERS.find((l) => l.key === 'pvp') as GameMapLayer).icon as GameMapIcon)
          : TERRITORY_ICONS[side as Side];
      pins.push({
        key: `${kind}:${key}`,
        ...point,
        title: this.pageName(target),
        lines: [
          kind === 'pvp' ? this.translate.instant('WORLD_EDITOR.GAME_MAP_WORLD_PVP') : (this.landText(target) as string),
          this.translate.instant('WORLD_EDITOR.GAME_MAP_OPEN_MAP'),
        ],
        icon,
        side,
        opens: target.key,
        position: { ...fromGameMap(page.bounds as WorldBounds, point), z: 0 },
        mapId: page.mapId,
        kind,
      });
    });
    return pins;
  });

  /**
   * Portals and crossings on the page (as AoWoW's): area triggers sending to another continent's map or another zone
   * (the Dark Portal, Rut'theran Village to Darnassus), and portal objects (Shattrath's, Dalaran's…); a click opens where
   * they lead.
   */
  private readonly portalPins = computed<GamePin[]>(() => {
    const page = this.page() as GamePage;
    const triggers = this.triggers().get(page.mapId) as AreaTriggerInfo[];
    const byTrigger = new Map(this.teleports().map((t) => [t.id, t]));
    const ways: { key: string; name: string; mapId: number; x: number; y: number; targetMap: number; tx: number; ty: number }[] = [];
    for (const trigger of triggers) {
      const teleport = byTrigger.get(trigger.id);
      if (teleport?.target && !/leap of faith/i.test(teleport.name)) {
        ways.push({
          key: `portal:t${trigger.id}`,
          name: teleport.name,
          ...trigger,
          targetMap: teleport.targetMap,
          tx: teleport.target.x,
          ty: teleport.target.y,
        });
      }
    }
    this.portals().forEach((portal, i) => ways.push({ key: `portal:o${i}`, ...portal }));
    const layer = GAME_MAP_LAYERS.find((l) => l.key === 'portal') as GameMapLayer;
    const pins: GamePin[] = [];
    for (const way of ways) {
      const point = CONTINENT_ORDER.includes(way.targetMap) ? this.placeOn(page, way.mapId, way) : undefined;
      const from = point && pageAt(this.pages(), way.mapId, way.x, way.y);
      const to = point && pageAt(this.pages(), way.targetMap, way.tx, way.ty);
      if (point && to && from !== to && to.kind !== 'continent' && to.kind !== 'world') {
        pins.push({
          key: way.key,
          ...point,
          title: way.name,
          lines: [
            this.translate.instant(layer.label),
            this.translate.instant('WORLD_EDITOR.GAME_MAP_PORTAL_TO', { zone: this.pageName(to) }),
          ],
          icon: layer.icon,
          opens: to.key,
          position: { x: way.x, y: way.y, z: 0 },
          mapId: way.mapId,
          kind: 'portal',
        });
      }
    }
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

  /** The transports whose path crosses the page: their lines and stops on it, and how long they take. */
  private readonly transportRuns = computed(() => {
    const page = this.page();
    if (!page?.bounds) {
      return [];
    }
    const factions = this.factions();
    const runs: {
      transport: GameMapTransport;
      kind: string;
      side?: Side;
      ship: string;
      route?: string;
      lines: RoutePoint[][];
      stops: { at: RoutePoint; wait: number; node: TaxiPathNode }[];
      legs: RouteStop[];
    }[] = [];
    for (const transport of this.transports()) {
      const nodes = this.transportNodes().get(transport.path);
      if (!nodes?.length) {
        continue;
      }
      const place = (node: TaxiPathNode): RoutePoint | undefined => {
        const point = this.placeOn(page, node.mapId, node);
        return point && [point.u * 100, point.v * 100];
      };
      const { lines, stops } = routeLines(nodes, place, page.kind === 'continent' ? 0.06 : 0.15);
      if (lines.length) {
        const description = describeTransport(transport.description || transport.name);
        runs.push({
          transport,
          kind: transportKind(transport.description || transport.name),
          side: description.side ?? factionSide(factions?.templates.get(transport.faction)),
          ship: description.ship,
          route: description.route,
          lines,
          stops,
          legs: routeStops(nodes),
        });
      }
    }
    return runs;
  });

  /** The routes drawn (as AoWoW's): dashed in their side's colour, arrows the way they go, their number, their stops. */
  protected readonly routes = computed<GameRoute[]>(() =>
    this.shown().has('routes')
      ? this.transportRuns()
          .filter((run) => this.shown().has(run.kind))
          .map((run) => {
            const { transport, side, lines } = run;
            const stops = run.stops
              .map(({ at, wait }) => ({
                near: routeNearest(lines, at, FRAME_W, FRAME_H) as NonNullable<ReturnType<typeof routeNearest>>,
                wait,
              }))
              .filter(({ near }) => near.distance <= ((this.page() as GamePage).kind === 'continent' ? 10 : 24))
              .map(({ near, wait }) => {
                const a = (near.angle * Math.PI) / 180;
                return {
                  u: near.u,
                  v: near.v,
                  angle: near.angle,
                  text: this.translate.instant('WORLD_EDITOR.GAME_MAP_WAIT', { time: this.timeText(wait) }),
                  dx: -Math.sin(a) * 22,
                  dy: Math.cos(a) * 22,
                };
              });
            const legs = run.legs.find((leg) => run.stops.some(({ node }) => node.x === leg.x && node.y === leg.y));
            return {
              key: `route:${transport.entry}`,
              entry: transport.entry,
              side: side === 'alliance' ? 'a' : side === 'horde' ? 'h' : 'n',
              d: lines.map((line) => `M${line.map(([u, v]) => `${u.toFixed(2)} ${v.toFixed(2)}`).join('L')}`).join(''),
              lines,
              arrows: lines.flatMap((line) => routeArrows(line, FRAME_W, FRAME_H)),
              label: routeLabel(lines, FRAME_W, FRAME_H),
              stops,
              title: `${transport.entry} · ${run.ship}`,
              kind: this.translate.instant((GAME_MAP_LAYERS.find((l) => l.key === run.kind) as GameMapLayer).label),
              route: run.route,
              times: this.travelTimes(transport, run.legs, legs),
            } as GameRoute;
          })
      : [],
  );

  /** "Wait time", "Travel 1-way" (from a stop) and "Travel 2-way" (a whole loop), when known. */
  private travelTimes(transport: GameMapTransport, legs: RouteStop[], from: RouteStop | undefined): string[] {
    if (!legs.length) {
      return [];
    }
    const times = from
      ? [
          this.translate.instant('WORLD_EDITOR.GAME_MAP_WAIT_TIME', { time: this.timeText(from.wait) }),
          this.translate.instant('WORLD_EDITOR.GAME_MAP_ONE_WAY', {
            time: this.timeText(legTime(from.leg, transport.speed, transport.accel)),
          }),
        ]
      : [];
    return [
      ...times,
      this.translate.instant('WORLD_EDITOR.GAME_MAP_TWO_WAY', { time: this.timeText(roundTrip(legs, transport.speed, transport.accel)) }),
    ];
  }

  /** A time: "45 sec", "1.5 min". */
  private timeText(seconds: number): string {
    return seconds < 60
      ? this.translate.instant('WORLD_EDITOR.GAME_MAP_SECONDS', { n: Math.round(seconds) })
      : this.translate.instant('WORLD_EDITOR.GAME_MAP_MINUTES', { n: Math.round(seconds / 6) / 10 });
  }

  /** The route under the pointer. */
  protected readonly hoverRoute = computed(() => {
    const hover = this.hover();
    return hover
      ? this.routes().find(
          (route) =>
            (routeNearest(route.lines, [hover.point.u * 100, hover.point.v * 100], FRAME_W, FRAME_H) as { distance: number }).distance <=
            ROUTE_HOVER,
        )
      : undefined;
  });

  /** A transport's icon (anchor, zeppelin…) at each of its stops on the picture (where its line starts, without any). */
  private readonly transportPins = computed<GamePin[]>(() =>
    this.transportRuns()
      .filter((run) => this.shown().has(run.kind))
      .flatMap(({ transport, kind, side, ship, route, lines, stops, legs }) => {
        const layer = GAME_MAP_LAYERS.find((l) => l.key === kind) as GameMapLayer;
        const icon: GameMapIcon =
          kind === 'boat'
            ? TRAVEL_ICONS.boat[side ?? 'neutral']
            : kind === 'transport'
              ? (layer.icon as GameMapIcon)
              : TRAVEL_ICONS.zeppelin[side ?? 'neutral'];
        const docks = stops.length ? stops.map(({ at, node }) => ({ at, node })) : [{ at: lines[0][0], node: undefined }];
        return docks.map(({ at, node }, i) => {
          const point = { u: at[0] / 100, v: at[1] / 100 };
          return {
            key: `transport:${transport.entry}:${i}`,
            ...point,
            title: ship,
            lines: [
              this.translate.instant(layer.label),
              route ?? '',
              ...this.travelTimes(
                transport,
                legs,
                legs.find((leg) => node && leg.x === node.x && leg.y === node.y),
              ),
              this.translate.instant('WORLD_EDITOR.GAME_MAP_TRANSPORT_ID', { entry: transport.entry, path: transport.path }),
            ].filter(Boolean),
            icon,
            side,
            badges: side ? [side] : [],
            position: { ...fromGameMap((this.page() as GamePage).bounds as WorldBounds, point), z: 0 },
            mapId: (this.page() as GamePage).mapId,
          };
        });
      }),
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
    if (this.seamlessOn()) {
      return this.zoom() >= SEAMLESS_LOAD_ZOOM && page?.mapId === this.mapId();
    }
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
          void this.loadSpawns(page);
        }
      });
    });
    // the seamless map's zone pictures and minimaps on screen
    effect(() => {
      const zones = this.seamlessZones();
      untracked(() => zones.forEach((zone) => void this.load(zone.page, this.overlaysOf(zone.page))));
    });
    effect(() => {
      const tiles = this.seamlessTiles();
      untracked(() => tiles.forEach((tile) => void this.loadTile(tile.directory, tile.tile, tile.key)));
    });
    // the transports' paths, once their list is known
    effect(() => {
      const transports = this.transports();
      if (transports.length && this.data() && !this.transportNodesAsked) {
        this.transportNodesAsked = true;
        untracked(() => void this.loadTransportNodes(transports));
      }
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
    // (on the seamless map, a zone is shown where it is on its continent)
    const seamless = this.seamless() ? this.seamlessTarget(key) : undefined;
    if (seamless) {
      if (this.pageKey() !== seamless.continent.key) {
        this.show(seamless.continent.key);
      }
      this.openMenu.set(undefined);
      this.zoomToRect(seamless.region.rect);
      return;
    }
    this.show((firstPage(this.pages(), key) as GamePage).key);
  }

  private show(key: string): void {
    void this.loadMapData((this.pages().get(key) as GamePage).mapId);
    this.pageKey.set(key);
    this.hover.set(undefined);
    this.hoverPin.set(undefined);
    this.zoom.set(1);
    this.pan.set({ x: 0, y: 0 });
    this.openMenu.set(undefined);
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
    this.viewportSize.set({ width: viewport.width, height: viewport.height });
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
    if (event.altKey) {
      void this.copyGo(event);
    } else if (target && !(this.seamlessOn() && this.zoneShown(target.key))) {
      this.open(target.key);
    }
  }

  /** A right click copies a `.go` command for the place under the pointer. */
  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    void this.copyGo(event);
  }

  protected onPointerLeave(): void {
    this.press = undefined;
    this.hover.set(undefined);
  }

  /** The height a place of a page is taken at: the camera's on its map (the map has no heights), else 0. */
  private heightOn(page: GamePage): number {
    return page.mapId === this.mapId() ? (this.camera()?.z ?? 0) : 0;
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const viewport = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.viewportSize.set({ width: viewport.width, height: viewport.height });
    const [px, py] = [event.clientX - viewport.left - viewport.width / 2, event.clientY - viewport.top - viewport.height / 2];
    const before = this.zoom();
    const zoom = Math.min(this.maxZoom(), Math.max(MIN_ZOOM, before * (event.deltaY < 0 ? 1.25 : 0.8)));
    const pan = this.pan();
    // keep the point under the pointer where it is
    this.pan.set(zoom === MIN_ZOOM ? { x: 0, y: 0 } : { x: px - ((px - pan.x) / before) * zoom, y: py - ((py - pan.y) / before) * zoom });
    this.zoom.set(zoom);
  }

  protected zoomBy(factor: number): void {
    this.measure();
    const zoom = Math.min(this.maxZoom(), Math.max(MIN_ZOOM, this.zoom() * factor));
    const pan = this.pan();
    this.pan.set(zoom === MIN_ZOOM ? { x: 0, y: 0 } : { x: (pan.x / this.zoom()) * zoom, y: (pan.y / this.zoom()) * zoom });
    this.zoom.set(zoom);
  }

  protected resetZoom(): void {
    this.zoom.set(1);
    this.pan.set({ x: 0, y: 0 });
  }

  /**
   * The `.go` command for the place under the pointer, as AoWoW's: `.go zonexy` on a zone of a continent (the server
   * finds the ground), on a continent for the zone under the pointer; `.go xyz` on other maps (instances, floors).
   */
  private goCommand(page: GamePage, point: GameMapPoint): string | undefined {
    const xy = (u: number, v: number) =>
      `${(Math.min(1, Math.max(0, u)) * 100).toFixed(2)} ${(Math.min(1, Math.max(0, v)) * 100).toFixed(2)}`;
    if (page.kind === 'zone' && this.continent()) {
      return `.go zonexy ${xy(point.u, point.v)} ${page.areaId}`;
    }
    if (page.kind === 'continent') {
      const zone = this.zoneAt(point);
      return zone && `.go zonexy ${xy(zone.u, zone.v)} ${zone.target.areaId}`;
    }
    if (!page.bounds) {
      return undefined;
    }
    const { x, y } = fromGameMap(page.bounds, point);
    return `.go xyz ${x.toFixed(1)} ${y.toFixed(1)} ${this.heightOn(page).toFixed(1)} ${page.mapId}`;
  }

  /** The zone of the continent shown under a point (the smallest: cities lie inside their zone), and where it is in it. */
  private zoneAt(point: GameMapPoint): { target: GamePage; u: number; v: number } | undefined {
    const page = this.page() as GamePage;
    const key = [...this.regions()]
      .filter(([, rings]) => pointInRings(point.u * 100, point.v * 100, rings))
      .sort(([, a], [, b]) => ringsArea(a) - ringsArea(b))[0]?.[0];
    const region = page.regions.find((r) => r.page === key);
    const target = key ? this.targetOf(key) : undefined;
    if (!region || !target) {
      return undefined;
    }
    const { left, top, right, bottom } = region.rect;
    return { target, u: (point.u - left) / (right - left), v: (point.v - top) / (bottom - top) };
  }

  /** Copies the `.go` command for the place under the pointer, with a note by it. */
  private async copyGo(event: MouseEvent): Promise<void> {
    const page = this.page();
    const hover = this.hover();
    const command = page && hover ? this.goCommand(page, hover.point) : undefined;
    if (!command) {
      this.showToast(event, this.translate.instant('WORLD_EDITOR.GAME_MAP_NO_GO'), true);
      return;
    }
    try {
      await navigator.clipboard.writeText(command);
      this.copied.set(command);
      this.showToast(event, this.translate.instant('WORLD_EDITOR.GAME_MAP_COPIED', { command }), false);
    } catch (error) {
      console.warn('[World Editor] Could not copy the .go command:', error);
      this.showToast(event, command, false);
    }
  }

  private showToast(event: MouseEvent, text: string, error: boolean): void {
    const viewport = ((event.currentTarget as HTMLElement | null)?.closest('.game-map-viewport') ??
      event.currentTarget) as HTMLElement | null;
    const box = viewport?.getBoundingClientRect() ?? new DOMRect();
    this.toast.set({ x: event.clientX - box.left + 12, y: event.clientY - box.top - 28, text, error });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(undefined), TOAST_MS);
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

  /** Loads the spawns of the zone shown (on the seamless map: of what is on screen). */
  protected loadZone(): void {
    const bounds = (this.page() as GamePage).bounds as WorldBounds;
    if (!this.seamlessOn()) {
      this.regionSelected.emit(bounds);
      return;
    }
    const box = this.visibleBox();
    const a = fromGameMap(bounds, { u: Math.max(0, box.left), v: Math.max(0, box.top) });
    const b = fromGameMap(bounds, { u: Math.min(1, box.right), v: Math.min(1, box.bottom) });
    this.regionSelected.emit({ minX: b.x, maxX: a.x, minY: b.y, maxY: a.y });
  }

  // ------------------------------------------------------------------ layers

  protected iconOf(icon: GameMapIcon | undefined): string | undefined {
    return icon?.asset ? `${POI_ASSETS}${icon.asset}.png` : icon?.path ? this.icons().get(iconKey(icon)) : undefined;
  }

  protected badgeIcon(side: Side): string | undefined {
    return this.iconOf(BADGE_ICONS[side]);
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

  /** A minimap tile of the seamless map (once). */
  private async loadTile(directory: string, tile: TileCoord, key: string): Promise<void> {
    if (this.tilesAsked.has(key)) {
      return;
    }
    this.tilesAsked.add(key);
    const image = await this.client.getMinimap(directory, tile).catch(() => undefined);
    this.tileImages.update((map) => new Map(map).set(key, image ? imageToDataUrl(image) : null));
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
    if (this.outlinesAsked.has(key)) {
      return;
    }
    this.outlinesAsked.add(key);
    const started = performance.now();
    const outlines = await trace().catch((error: Error) => {
      console.warn(`[World Editor] Could not trace the world map's ${key}:`, error);
      return new Map<string, Ring[]>();
    });
    perfNote(`game map: ${key}, ${outlines.size} outlines after ${Math.round(performance.now() - started)} ms`);
    this.outlines.update((map) => new Map(map).set(key, outlines));
  }

  /** The area triggers of a map (read once). */
  private async loadMapData(mapId: number): Promise<void> {
    if (!this.triggers().has(mapId)) {
      this.triggers.update((map) => new Map(map).set(mapId, []));
      const triggers = await this.client.getAreaTriggers(mapId).catch(() => []);
      this.triggers.update((map) => new Map(map).set(mapId, triggers));
    }
  }

  /** The creatures spawned on a zone's picture (once), for its sub-zones' levels. */
  private async loadSpawns(page: GamePage): Promise<void> {
    const read = this.spawnLevels();
    if (page.kind !== 'zone' || this.pageSpawns().has(page.key)) {
      return;
    }
    this.pageSpawns.update((map) => new Map(map).set(page.key, []));
    if (!read) {
      return;
    }
    const spawns = await read(page.mapId, page.bounds as WorldBounds).catch((error: Error) => {
      console.warn(`[World Editor] Could not read the creatures of ${page.key} for its levels:`, error);
      return [];
    });
    this.pageSpawns.update((map) => new Map(map).set(page.key, spawns));
  }

  /** The paths of the transports (every map, with their stops). */
  private async loadTransportNodes(transports: GameMapTransport[]): Promise<void> {
    const nodes = await this.client.getTaxiPathNodes(transports.map((t) => t.path)).catch((error: Error) => {
      console.warn("[World Editor] Could not read the transports' paths for the world map:", error);
      return new Map<number, TaxiPathNode[]>();
    });
    this.transportNodes.set(nodes);
  }

  /** The layers' icons and the badges that are the client's (parts cut out). */
  private async loadIcons(): Promise<void> {
    const icons = [...GAME_MAP_LAYERS.map((layer) => layer.icon as GameMapIcon), ...Object.values(BADGE_ICONS)].filter(
      (icon) => icon?.path,
    );
    for (const icon of icons) {
      const image = await this.client.getTexture(icon.path as string).catch(() => undefined);
      if (image) {
        const part = icon.crop ? cropImage(image, ...icon.crop) : image;
        this.icons.update((map) => new Map(map).set(iconKey(icon), imageToPngUrl(part)));
      }
    }
  }
}
