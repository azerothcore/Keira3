import {
  AmbientLight,
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Fog,
  Group,
  HemisphereLight,
  Intersection,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineLoop,
  LineSegments,
  LinearFilter,
  LinearMipmapLinearFilter,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  OctahedronGeometry,
  PerspectiveCamera,
  Raycaster,
  RingGeometry,
  RGBAFormat,
  Scene,
  SphereGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  LightSample,
  LiquidKind,
  LiquidMesh,
  orientationToSceneYaw,
  RgbaImage,
  sceneToWorld,
  sceneYawToOrientation,
  SPLAT_SIZE,
  TerrainChunkMesh,
  TerrainMeshData,
  TileCoord,
  tileKey,
  WorldPosition,
  worldToScene,
} from '@keira/shared/wow-data';
import { createSkyDome, setSkyColors } from './sky';
import { ROOF_LAYER } from './wmo-object';
import { COLLISION_LAYER, SERVER_COLLISION_LAYER } from './collision-object';
import { createTerrainLighting, createTerrainMaterial } from './terrain-material';
import {
  PickResult,
  SpawnKind,
  WaypointCheck,
  WaypointCheckStatus,
  WaypointPath,
  WaypointPlace,
  waypointKey,
  WorldAreaTrigger,
  WorldLink,
  WorldMarker,
  WorldSpawn,
} from './world-viewer.model';

type MarkerState = 'normal' | 'pending' | 'selected';

export interface PickOptions {
  /** How far (in normalised device units) from the cursor a marker may be and still be picked. */
  tolerance?: number;
  groundOnly?: boolean;
  markersOnly?: boolean;
  /** Also pick the direction arrows of paths (hover labels), as `segment` results. */
  segments?: boolean;
  /** Also pick area trigger volumes (hover labels), as `areatrigger` results. */
  areaTriggers?: boolean;
  /** Also pick overlay markers (hover labels), as `overlay` results. */
  overlays?: boolean;
}

interface SegmentData {
  segment: { pathKey: string; from: number; to: number };
}

interface PickableData {
  key: string;
  kind: SpawnKind | 'waypoint';
  pathKey?: string;
  point?: number;
}

/** Extra data of spawn pins. */
interface SpawnMarkerData {
  pending?: boolean;
  /** Set while the spawn is drawn with its model. */
  modelScale?: number;
}

const SPAWN_MODEL_NAME = 'model';
const WANDER_RING_NAME = 'wander';
const FACING_ARROW_NAME = 'facing';
/** Default colour and opacity of each liquid. */
const LIQUID_LOOK: Record<LiquidKind, [number, number]> = {
  water: [0x2a6b9c, 0.65],
  ocean: [0x1d4f7a, 0.75],
  magma: [0xff5a1f, 0.95],
  slime: [0x5fbf3a, 0.85],
};
const POINTER_NAME = 'pointer';
const DEFAULT_LIGHTS = { sun: 1.6, hemisphere: 1.2, ambient: 0.35 };
const ZONE_LIGHTS = { sun: 1.8, ambient: 1.6 };
const DEFAULT_FOG = { near: 600, far: 1600 };
/** Zone fog never closes in nearer than this (yards), so the editor can still see around. */
const MIN_FOG_END = 400;
/** How far above an object snapping still looks for ground (yards): enough for a stair step or a small ledge. */
const GROUND_STEP = 2;
/** Waypoints more than this (yards) above the floor or liquid below them are in the air (flying creatures). */
export const AIR_WAYPOINT_HEIGHT = 3;
/** Colours of the "Check path" marks over waypoints. */
export const WAYPOINT_CHECK_COLORS: Record<WaypointCheckStatus, number> = { ok: 0x2ecc71, warn: 0xf1c40f, bad: 0xe74c3c };
const CHECK_MARK_NAME = 'check';
/** Snap to wall looks this far around (yards), in this many directions, and leaves this gap. */
const WALL_SNAP_DISTANCE = 6;
const WALL_SNAP_DIRECTIONS = 16;
/** What the Path / LOS tool draws: A, C, the walking path, the line of sight (eye to eye) and where to attack from. */
export interface ProbeDrawing {
  from: WorldPosition;
  to?: WorldPosition;
  path?: WorldPosition[];
  sight?: { from: WorldPosition; to: WorldPosition; blockedAt?: WorldPosition };
  attackFrom?: WorldPosition;
}

const PROBE_COLORS = {
  path: 0x22d3ee,
  clear: 0x4ade80,
  blocked: 0xef4444,
  hidden: 0x6b7280,
  from: 0x3b82f6,
  to: 0xef4444,
  attack: 0xfacc15,
};

/** Area triggers with no radius still get a small sphere, to be seen. */
const MIN_TRIGGER_RADIUS = 0.5;
const WALL_SNAP_GAP = 0.1;

const COLORS = {
  sky: 0x9cc3e6,
  creature: 0xff9f1c,
  gameobject: 0x2ec4f1,
  selected: 0xfff35c,
  areaTrigger: 0xc77dff,
  terrain: 0x5f8a3a,
};
const PATH_COLORS = [0xe63946, 0xb5179e, 0x7209b7, 0x06d6a0, 0x4361ee, 0xff006e, 0x8ac926, 0xffffff];
const WAYPOINT_LIFT = 0.4;
/** Render layer of liquid surfaces: seen by the camera, ignored by picking (raycaster uses layer 0). */
const LIQUID_LAYER = 1;
/** Markers keep a readable on-screen size: real size up close, scaled up with camera distance. */
const MARKER_SCALE_DISTANCE = 120;
const MARKER_MAX_SCALE = 8;

/** Stable colour per path key, so a path keeps its colour across reloads. */
export function pathColor(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return PATH_COLORS[Math.abs(hash) % PATH_COLORS.length];
}

/**
 * The 3D world without a renderer: terrain tiles, spawn markers and waypoint paths in a Three.js scene, plus picking.
 * Everything is placed with server coordinates and converted with `worldToScene`.
 */
export class WorldScene {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(60, 1, 0.5, 4000);

  private readonly terrainGroup = new Group();
  /** Buildings (WMO), streamed by `WorldObjects`; they count as ground for picking and snapping. */
  readonly buildingGroup = new Group();
  /** Trees, rocks and props (M2), streamed by `WorldDoodads`; never picked, so they don't catch clicks meant for the ground. */
  readonly doodadGroup = new Group();
  /** The server's navigation mesh (mmaps), when shown. */
  readonly navMeshGroup = new Group();
  private groupKeys = new Set<string>();
  /** The movement simulation's moving copy of a spawn. */
  private readonly ghostGroup = new Group();
  /** Lines and labelled markers, see `setOverlays`. */
  private readonly overlayGroup = new Group();
  private readonly overlayMarkers: Mesh[] = [];
  /** A diamond on a thin stick, standing on its position. */
  private readonly overlayMarkerGeometry = mergeGeometries([
    new OctahedronGeometry(0.6).translate(0, 2.4, 0),
    // the octahedron isn't indexed: neither may the stick be, to merge them
    new CylinderGeometry(0.05, 0.05, 1.8, 6).translate(0, 0.9, 0).toNonIndexed(),
  ]);
  /** The server's collision (vmaps) around the camera, see `WorldVmaps`. */
  readonly serverCollisionGroup = new Group();
  private useServerCollision = false;
  private readonly spawnGroup = new Group();
  private readonly waypointGroup = new Group();
  private readonly raycaster = new Raycaster();

  private readonly terrainTiles = new Map<string, Object3D>();
  /** Sun and ambient light of the textured terrain (updated by zone lighting). */
  readonly terrainLighting = createTerrainLighting();
  private readonly liquidMaterials = new Map<LiquidKind, MeshLambertMaterial>();
  /** Zone colours of water and sea, when zone lighting is on. */
  private liquidLight?: { water: Color; ocean: Color };
  private readonly objects = new Map<string, Object3D>();
  private selectedKey?: string;

  /** Upright pin standing on the spawn point, with a nose pointing where the creature faces (−z before rotation). */
  private readonly creatureGeometry = mergeGeometries([
    new CylinderGeometry(0.45, 0.45, 2.2, 10).translate(0, 1.1, 0),
    new ConeGeometry(0.35, 1.1, 8).rotateX(-Math.PI / 2).translate(0, 1.7, -0.9),
  ]);
  private readonly gameobjectGeometry = new BoxGeometry(1.2, 1.2, 1.2).translate(0, 0.6, 0);
  /**
   * Waypoint markers by place: a cone on the ground, a square pyramid in the air, a pentagonal pyramid in water or
   * under the map (flight paths use triangular pyramids).
   */
  private readonly waypointGeometries: Record<WaypointPlace, BufferGeometry> = {
    ground: new ConeGeometry(0.45, 1, 16),
    air: new ConeGeometry(0.6, 1, 4).rotateY(Math.PI / 4),
    water: new ConeGeometry(0.55, 1, 5),
    under: new ConeGeometry(0.55, 1, 5),
  };
  /** Arrow heads of flight paths: triangular pyramids. */
  private readonly flightArrowGeometry = new ConeGeometry(0.7, 1.6, 3);
  private readonly waypointPlaces = new Map<string, WaypointPlace>();
  /** "Check path" marks: an exclamation mark (bar and dot) over the point, in its status colour. */
  private readonly checkBarGeometry = new CylinderGeometry(0.12, 0.08, 0.8, 8).translate(0, 1.75, 0);
  private readonly checkDotGeometry = new SphereGeometry(0.12, 8, 6).translate(0, 1.15, 0);
  private readonly checkMaterials = Object.fromEntries(
    Object.entries(WAYPOINT_CHECK_COLORS).map(([status, color]) => [
      status,
      new MeshBasicMaterial({ color, depthTest: false, transparent: true }),
    ]),
  ) as Record<WaypointCheckStatus, MeshBasicMaterial>;
  private waypointChecks: WaypointCheck[] = [];
  private readonly liquidRaycaster = new Raycaster();
  private readonly arrowGeometry = new ConeGeometry(0.4, 1.2, 8);
  /** Unit-length arrow along −z from the origin (shaft and head), scaled to each model. */
  private readonly facingArrowGeometry = mergeGeometries([
    new CylinderGeometry(0.03, 0.03, 0.7, 6).rotateX(Math.PI / 2).translate(0, 0, -0.35),
    new ConeGeometry(0.09, 0.3, 8).rotateX(-Math.PI / 2).translate(0, 0, -0.85),
  ]);
  /** Facing arrows in the colour of their kind's pins: creatures amber, gameobjects cyan. */
  private readonly facingArrowMaterials = {
    creature: new MeshBasicMaterial({ color: COLORS.creature, depthTest: false, transparent: true, opacity: 0.9 }),
    gameobject: new MeshBasicMaterial({ color: COLORS.gameobject, depthTest: false, transparent: true, opacity: 0.9 }),
  };
  private facingArrowsVisible = true;
  private readonly beacon = createBeacon();
  /** The Path / LOS tool's drawing: the path, the line of sight and the points. */
  readonly probeGroup = new Group();
  private readonly probeHandles = new Map<'from' | 'to', Group>();
  private readonly losRaycaster = new Raycaster();
  /** Unit circle on the ground (scaled to each creature's wander distance). */
  private readonly ringGeometry = new BufferGeometry().setFromPoints(
    Array.from({ length: 64 }, (_, i) => new Vector3(Math.cos((i / 64) * Math.PI * 2), 0.3, Math.sin((i / 64) * Math.PI * 2))),
  );
  /** Area triggers: see-through purple volumes with solid edges. */
  readonly triggerGroup = new Group();
  private readonly triggerMaterial = new MeshBasicMaterial({
    color: COLORS.areaTrigger,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    side: DoubleSide,
  });
  private readonly triggerEdgeMaterial = new LineBasicMaterial({ color: COLORS.areaTrigger });
  private readonly wanderMaterial = new LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.8 });
  private readonly boundingMaterial = new LineBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.9 });
  private readonly reachMaterial = new LineBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.9 });
  /** Nose on a waypoint ball, pointing to the next point (along +y before rotation, starting at the ball's surface). */
  private readonly pointerGeometry = new ConeGeometry(0.3, 0.8, 8).translate(0, 0.85, 0);
  private readonly arrows = new Set<Object3D>();
  private readonly markerMaterials = new Map<string, MeshLambertMaterial>();
  private readonly sun = new DirectionalLight(0xffffff, DEFAULT_LIGHTS.sun);
  private readonly hemisphere = new HemisphereLight(0xdbeeff, 0x4a3b2a, DEFAULT_LIGHTS.hemisphere);
  private readonly ambient = new AmbientLight(0xffffff, DEFAULT_LIGHTS.ambient);
  private readonly sky = createSkyDome();
  /** Pins of spawns drawn with their real model: not rendered, but still picked (so small models stay clickable). */
  private readonly hiddenMarkerMaterial = new MeshBasicMaterial({ visible: false });

  constructor() {
    this.scene.background = new Color(COLORS.sky);
    this.scene.fog = new Fog(COLORS.sky, DEFAULT_FOG.near, DEFAULT_FOG.far);
    this.terrainGroup.name = 'terrain';
    this.buildingGroup.name = 'buildings';
    this.doodadGroup.name = 'doodads';
    this.spawnGroup.name = 'spawns';
    this.waypointGroup.name = 'waypoints';
    this.scene.add(
      this.terrainGroup,
      this.buildingGroup,
      this.doodadGroup,
      this.spawnGroup,
      this.waypointGroup,
      this.triggerGroup,
      this.navMeshGroup,
      this.serverCollisionGroup,
      this.overlayGroup,
      this.ghostGroup,
    );
    this.overlayGroup.name = 'overlays';
    this.serverCollisionGroup.name = 'server-collision';
    this.camera.layers.enable(LIQUID_LAYER);
    this.setRoofsVisible(true);

    this.sun.position.set(300, 600, 200);
    this.scene.add(this.hemisphere, this.ambient, this.sun, this.sky, this.beacon, this.probeGroup);
  }

  /**
   * Line of sight between two points, like the server's vmaps: blocked by the terrain and by the collision of buildings
   * and models (only those loaded around the camera): the server's own (vmaps) once loaded, the client's until then.
   * Returns where the line is first blocked, if it is.
   */
  lineOfSightBlock(from: WorldPosition, to: WorldPosition): WorldPosition | undefined {
    const start = scenePoint(from);
    const end = scenePoint(to);
    const length = start.distanceTo(end);
    if (length === 0) {
      return undefined;
    }
    this.scene.updateMatrixWorld();
    const blockers: Object3D[] = [...this.terrainGroup.children];
    const worldGroups = this.useServerCollision ? [this.serverCollisionGroup] : [this.buildingGroup, this.doodadGroup];
    for (const group of [...worldGroups, this.spawnGroup]) {
      group.traverse((object) => {
        if (object.layers.isEnabled(COLLISION_LAYER) || object.layers.isEnabled(SERVER_COLLISION_LAYER)) {
          blockers.push(object);
        }
      });
    }
    this.losRaycaster.layers.enableAll();
    this.losRaycaster.set(start, end.clone().sub(start).normalize());
    this.losRaycaster.far = length;
    const hit = this.losRaycaster.intersectObjects(blockers, true)[0];
    return hit ? sceneToWorld(hit.point) : undefined;
  }

  /** Draws (or clears, with undefined) the Path / LOS tool's result. */
  setProbe(probe: ProbeDrawing | undefined): void {
    this.probeGroup.traverse((object) => {
      if (object instanceof Line || object instanceof Mesh) {
        object.geometry.dispose();
        (object.material as Material).dispose();
      }
    });
    this.probeGroup.clear();
    if (!probe) {
      this.probeHandles.clear();
      return;
    }
    const line = (points: WorldPosition[], color: number, lift = 0.3) => {
      const geometry = new BufferGeometry().setFromPoints(points.map((p) => scenePoint(p, lift)));
      const object = new Line(geometry, new LineBasicMaterial({ color, depthTest: false, transparent: true }));
      object.renderOrder = 5;
      this.probeGroup.add(object);
    };
    const dot = (position: WorldPosition, color: number, radius = 0.6) => {
      const mesh = new Mesh(new SphereGeometry(radius, 12, 8), new MeshBasicMaterial({ color, depthTest: false, transparent: true }));
      mesh.position.copy(scenePoint(position, 0.3));
      mesh.renderOrder = 6;
      this.probeGroup.add(mesh);
    };
    if (probe.path) {
      line(probe.path, PROBE_COLORS.path);
    }
    if (probe.sight) {
      const { from, to, blockedAt } = probe.sight;
      line(blockedAt ? [from, blockedAt] : [from, to], blockedAt ? PROBE_COLORS.blocked : PROBE_COLORS.clear, 0);
      if (blockedAt) {
        line([blockedAt, to], PROBE_COLORS.hidden, 0);
        dot(blockedAt, PROBE_COLORS.blocked, 0.35);
      }
    }
    this.probeHandles.clear();
    this.probeGroup.add(this.probeHandle('from', probe.from, PROBE_COLORS.from, probe.to));
    if (probe.to) {
      this.probeGroup.add(this.probeHandle('to', probe.to, PROBE_COLORS.to));
    }
    if (probe.attackFrom) {
      dot(probe.attackFrom, PROBE_COLORS.attack, 0.8);
      if (probe.to) {
        line([probe.attackFrom, probe.to], PROBE_COLORS.attack, 1);
      }
    }
  }

  /**
   * A, the start (blue), or C, the end (red), of the Path / LOS tool: a ball on a pin under a cone pointing down at it,
   * and at A a cone on the ground pointing towards C. Picked and dragged with `pickProbeHandle` / `moveProbeHandle`.
   */
  private probeHandle(which: 'from' | 'to', position: WorldPosition, color: number, towards?: WorldPosition): Group {
    const material = () => new MeshBasicMaterial({ color, depthTest: false, transparent: true });
    const handle = new Group();
    handle.name = `probe-${which}`;
    handle.position.copy(scenePoint(position, 0.3));
    const ball = new Mesh(new SphereGeometry(0.6, 12, 8), material());
    const pin = new Mesh(new CylinderGeometry(0.06, 0.06, 4, 6).translate(0, 2, 0), material());
    const head = new Mesh(new ConeGeometry(0.5, 1.2, 12).rotateX(Math.PI).translate(0, 4.6, 0), material());
    const parts: Mesh[] = [ball, pin, head];
    if (towards) {
      const flat = scenePoint(towards, 0.3).sub(handle.position).setY(0);
      if (flat.lengthSq() > 0) {
        const arrow = new Mesh(new ConeGeometry(0.4, 1.4, 12).rotateX(-Math.PI / 2).translate(0, 0, -1.6), material());
        arrow.rotation.y = Math.atan2(-flat.x, -flat.z);
        parts.push(arrow);
      }
    }
    for (const part of parts) {
      part.renderOrder = 6;
      part.userData = { probeHandle: which };
      handle.add(part);
    }
    this.probeHandles.set(which, handle);
    return handle;
  }

  /** The Path / LOS tool's A or C under the cursor (normalised device coordinates), if any. */
  pickProbeHandle(ndcX: number, ndcY: number): 'from' | 'to' | undefined {
    this.camera.updateMatrixWorld();
    this.scene.updateMatrixWorld();
    this.raycaster.setFromCamera(new Vector2(ndcX, ndcY), this.camera);
    const hit = this.raycaster.intersectObjects([...this.probeHandles.values()], true)[0];
    return hit?.object.userData['probeHandle'] as 'from' | 'to' | undefined;
  }

  /** Moves A or C while it's dragged (the tool is asked again once it's dropped). */
  moveProbeHandle(which: 'from' | 'to', position: WorldPosition): void {
    // (only dragged while drawn)
    (this.probeHandles.get(which) as Group).position.copy(scenePoint(position, 0.3));
  }

  /** Where A and C are drawn now. */
  probeHandlePositions(): { which: 'from' | 'to'; position: WorldPosition }[] {
    return [...this.probeHandles].map(([which, handle]) => {
      const p = sceneToWorld(handle.position);
      return { which, position: { ...p, z: p.z - 0.3 } };
    });
  }

  /** Shows the collision meshes of buildings and models (the server's hitboxes) as a wireframe. */
  setCollisionVisible(visible: boolean): void {
    for (const layer of [COLLISION_LAYER, SERVER_COLLISION_LAYER]) {
      if (visible) {
        this.camera.layers.enable(layer);
      } else {
        this.camera.layers.disable(layer);
      }
    }
  }

  /** Line of sight against the server's collision (vmaps, in `serverCollisionGroup`) instead of the client's. */
  setServerCollision(active: boolean): void {
    this.useServerCollision = active;
  }

  setRoofsVisible(visible: boolean): void {
    for (const layers of [this.camera.layers, this.raycaster.layers]) {
      if (visible) {
        layers.enable(ROOF_LAYER);
      } else {
        layers.disable(ROOF_LAYER);
      }
    }
  }

  // ---------------------------------------------------------------- lighting

  /** Lights the world like the zone (sun, ambient, fog and sky), or with the neutral default light (`undefined`). */
  applyLighting(sample: LightSample | undefined): void {
    const fog = this.scene.fog as Fog;
    const terrain = this.terrainLighting;
    if (!sample) {
      const defaults = createTerrainLighting();
      terrain.sunColor.value.copy(defaults.sunColor.value);
      terrain.ambientColor.value.copy(defaults.ambientColor.value);
      this.sun.color.set(0xffffff);
      this.sun.intensity = DEFAULT_LIGHTS.sun;
      this.ambient.color.set(0xffffff);
      this.ambient.intensity = DEFAULT_LIGHTS.ambient;
      this.hemisphere.intensity = DEFAULT_LIGHTS.hemisphere;
      (this.scene.background as Color).set(COLORS.sky);
      fog.color.set(COLORS.sky);
      fog.near = DEFAULT_FOG.near;
      fog.far = DEFAULT_FOG.far;
      this.sky.visible = false;
      this.liquidLight = undefined;
      this.liquidMaterials.forEach((material, kind) => this.styleLiquid(kind, material));
      return;
    }
    const color = (rgb: number[]) => new Color().setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace);
    // the terrain shader sums them in gamma space, like the client
    terrain.sunColor.value.setRGB(...sample.diffuse);
    terrain.ambientColor.value.setRGB(...sample.ambient);
    // buildings, props and models: the zone's sun and ambient replace the neutral sky light
    this.sun.color.copy(color(sample.diffuse));
    this.sun.intensity = ZONE_LIGHTS.sun;
    this.ambient.color.copy(color(sample.ambient));
    this.ambient.intensity = ZONE_LIGHTS.ambient;
    this.hemisphere.intensity = 0;
    const fogColor = color(sample.fog);
    (this.scene.background as Color).copy(fogColor);
    fog.color.copy(fogColor);
    // an editor looks farther than a player: keep a minimum view, but the zone's fog feel
    fog.far = Math.max(sample.fogEnd, MIN_FOG_END);
    fog.near = Math.min(Math.max(sample.fogStart, 0), fog.far * 0.9);
    setSkyColors(this.sky, {
      top: color(sample.skyTop),
      middle: color(sample.skyMiddle),
      horizon: color(sample.skyHorizon),
      ground: fogColor,
    });
    this.sky.visible = true;
    this.liquidLight = { water: color(sample.water), ocean: color(sample.ocean) };
    this.liquidMaterials.forEach((material, kind) => this.styleLiquid(kind, material));
  }

  // ---------------------------------------------------------------- terrain

  get terrainKeys(): string[] {
    return [...this.terrainTiles.keys()];
  }

  hasTerrainTile(key: string): boolean {
    return this.terrainTiles.has(key);
  }

  setTerrainTile(data: TerrainMeshData, image?: RgbaImage): void {
    const key = tileKey(data.tile);
    this.removeTerrainTile(key);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(data.positions, 3));
    geometry.setAttribute('uv', new BufferAttribute(data.uvs, 2));
    geometry.setIndex(new BufferAttribute(data.indices, 1));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();

    const material = new MeshLambertMaterial({ color: image ? 0xffffff : COLORS.terrain });
    if (image) {
      const texture = new DataTexture(image.data, image.width, image.height, RGBAFormat);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
      material.map = texture;
    }

    const mesh = new Mesh(geometry, material);
    mesh.name = `tile:${key}`;
    this.terrainTiles.set(key, mesh);
    this.terrainGroup.add(mesh);
  }

  /**
   * Textured terrain: one mesh per chunk, blending its tileset textures (`layers[i]` are the loaded textures of
   * `chunks[i].textures`). Shared tileset textures are not disposed with the tile; alpha maps are.
   */
  setTerrainTileDetailed(
    tile: TileCoord,
    chunks: { mesh: TerrainChunkMesh; layers: Texture[] }[],
    fallback: Texture,
    liquids: LiquidMesh[] = [],
  ): void {
    const key = tileKey(tile);
    this.removeTerrainTile(key);
    const group = new Group();
    group.name = `tile:${key}`;
    for (const { mesh, layers } of chunks) {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(mesh.positions, 3));
      geometry.setAttribute('normal', new BufferAttribute(mesh.normals, 3));
      geometry.setAttribute('layerUv', new BufferAttribute(mesh.layerUvs, 2));
      geometry.setAttribute('splatUv', new BufferAttribute(mesh.splatUvs, 2));
      geometry.setIndex(new BufferAttribute(mesh.indices, 1));
      geometry.computeBoundingSphere();
      const splat = mesh.splat ? createSplatTexture(mesh.splat) : undefined;
      group.add(new Mesh(geometry, createTerrainMaterial(layers, splat, this.terrainLighting, fallback)));
    }
    for (const liquid of liquids) {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(liquid.positions, 3));
      geometry.setIndex(new BufferAttribute(liquid.indices, 1));
      geometry.computeVertexNormals();
      const surface = new Mesh(geometry, this.liquidMaterial(liquid.kind));
      surface.name = 'liquid';
      surface.renderOrder = 1;
      // Drawn but not picked: placing and snapping use the ground under the water.
      surface.layers.set(LIQUID_LAYER);
      group.add(surface);
    }
    this.terrainTiles.set(key, group);
    this.terrainGroup.add(group);
  }

  /** Shared translucent material per liquid kind (not disposed with tiles). */
  private liquidMaterial(kind: LiquidKind): MeshLambertMaterial {
    let material = this.liquidMaterials.get(kind);
    if (!material) {
      material = new MeshLambertMaterial({ transparent: true, opacity: LIQUID_LOOK[kind][1], depthWrite: false, side: DoubleSide });
      material.userData['shared'] = true;
      this.styleLiquid(kind, material);
      this.liquidMaterials.set(kind, material);
    }
    return material;
  }

  /** Water and sea take the zone's colours (glowing a little, like the client's); magma and slime keep theirs. */
  private styleLiquid(kind: LiquidKind, material: MeshLambertMaterial): void {
    const zone = this.liquidLight && (kind === 'water' ? this.liquidLight.water : kind === 'ocean' ? this.liquidLight.ocean : undefined);
    if (zone) {
      material.color.copy(zone);
      material.emissive.copy(zone);
      material.emissiveIntensity = 0.6;
    } else {
      material.color.set(LIQUID_LOOK[kind][0]);
      material.emissive.set(kind === 'magma' ? 0xff3300 : 0x000000);
      material.emissiveIntensity = kind === 'magma' ? 0.8 : 0;
    }
  }

  removeTerrainTile(key: string): void {
    const tile = this.terrainTiles.get(key);
    if (tile) {
      this.terrainGroup.remove(tile);
      tile.traverse((object) => {
        if (object instanceof Mesh) {
          disposeTerrainMesh(object);
        }
      });
      this.terrainTiles.delete(key);
    }
  }

  clearTerrain(): void {
    this.terrainKeys.forEach((key) => this.removeTerrainTile(key));
  }

  // ---------------------------------------------------------------- spawns & waypoints

  getObject(key: string): Object3D | undefined {
    return this.objects.get(key);
  }

  get objectKeys(): string[] {
    return [...this.objects.keys()];
  }

  setSpawns(spawns: WorldSpawn[]): void {
    this.clearGroup(this.spawnGroup);
    for (const spawn of spawns) {
      const geometry = spawn.kind === 'creature' ? this.creatureGeometry : this.gameobjectGeometry;
      const marker = new Mesh(geometry, this.markerMaterial(spawn.kind, spawn.pending ? 'pending' : 'normal'));
      marker.name = spawn.key;
      marker.userData = { key: spawn.key, kind: spawn.kind, pending: !!spawn.pending } satisfies PickableData & { pending: boolean };
      placeObject(marker, spawn.position, spawn.orientation);
      const rings: [string, number | undefined, LineBasicMaterial][] = [
        [WANDER_RING_NAME, spawn.wanderRadius, this.wanderMaterial],
        ['bounding-radius', spawn.bounds?.radius, this.boundingMaterial],
        ['combat-reach', spawn.bounds?.reach, this.reachMaterial],
      ];
      for (const [name, radius, material] of rings) {
        if (radius) {
          const ring = new LineLoop(this.ringGeometry, material);
          ring.name = name;
          ring.userData = { radius };
          ring.raycast = () => undefined;
          marker.add(ring);
        }
      }
      this.addObject(this.spawnGroup, spawn.key, marker);
    }
    this.applySelection();
  }

  /**
   * Draws a spawn with its real model (`scale` = the model's own size) instead of its pin, or puts the pin back
   * (`model` undefined). The pin stays pickable and keeps following the gizmo; the model rides along as its child.
   * Returns false when the spawn isn't in the scene.
   */
  setSpawnModel(key: string, model: Object3D | undefined, scale = 1): boolean {
    const marker = this.objects.get(key);
    const data = marker?.userData as (PickableData & SpawnMarkerData) | undefined;
    if (!marker || !data || data.kind === 'waypoint') {
      return false;
    }
    const current = marker.getObjectByName(SPAWN_MODEL_NAME);
    if (current && current !== model) {
      marker.remove(current);
    }
    if (model) {
      model.name = SPAWN_MODEL_NAME;
      if (!model.getObjectByName(FACING_ARROW_NAME)) {
        model.add(this.facingArrowFor(model, data.kind));
      }
      // hits on the model pick the spawn
      model.traverse((object) => (object.userData = data));
      marker.add(model);
    }
    data.modelScale = model ? scale : undefined;
    this.applySelection();
    return true;
  }

  /**
   * Marks a place with a tall beam (seen from afar and through everything) and a ring on the ground, e.g. where a
   * teleport or "go to" landed; `undefined` removes it.
   */
  setBeacon(position: WorldPosition | undefined): void {
    this.beacon.visible = !!position;
    if (position) {
      this.beacon.position.copy(scenePoint(position));
    }
  }

  /** Puts a model (a player character) on the marker, facing north; undefined removes it. */
  setBeaconModel(model: Object3D | undefined): void {
    const old = this.beacon.getObjectByName('beacon-model');
    if (old) {
      this.beacon.remove(old);
    }
    if (model) {
      model.name = 'beacon-model';
      model.rotation.y = orientationToSceneYaw(0);
      this.beacon.add(model);
    }
  }

  /** Shows or hides the arrows through the middle of models that tell which way they face. */
  setFacingArrowsVisible(visible: boolean): void {
    this.facingArrowsVisible = visible;
    this.spawnGroup.traverse((object) => {
      if (object.name === FACING_ARROW_NAME) {
        object.visible = visible;
      }
    });
  }

  /**
   * An arrow through the centre of a model (half its height, middle of its footprint), sized to it and pointing to
   * its front (−z, like the pins' nose): shows the orientation of creatures and objects even when they're round.
   */
  private facingArrowFor(model: Object3D, kind: SpawnKind): Mesh {
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const arrow = new Mesh(this.facingArrowGeometry, this.facingArrowMaterials[kind]);
    arrow.name = FACING_ARROW_NAME;
    box.getCenter(arrow.position);
    arrow.scale.setScalar(Math.max(size.x, size.z, 0.5));
    arrow.renderOrder = 3;
    arrow.raycast = () => undefined;
    arrow.visible = this.facingArrowsVisible;
    return arrow;
  }

  /**
   * Draws lines between places (drawn over the terrain, with an optional arrow head) and labelled markers (diamonds on a
   * stick, picked with `PickOptions.overlays`); replaces what was drawn before.
   */
  setOverlays(links: WorldLink[], markers: WorldMarker[]): void {
    this.overlayGroup.traverse((object) => {
      if (object instanceof Line) {
        object.geometry.dispose();
      }
      if (object instanceof Line || object instanceof Mesh) {
        (object.material as Material).dispose();
      }
    });
    this.overlayGroup.clear();
    this.overlayMarkers.length = 0;
    const up = new Vector3(0, 1, 0);
    for (const link of links) {
      const points = [link.from, ...(link.via ?? []), link.to].map((p) => scenePoint(p, WAYPOINT_LIFT));
      const [from, to] = [points[points.length - 2], points[points.length - 1]];
      const material = link.dashed
        ? new LineDashedMaterial({ color: link.color, dashSize: 1.5, gapSize: 1, depthTest: false, transparent: true, opacity: 0.85 })
        : new LineBasicMaterial({ color: link.color, depthTest: false, transparent: true, opacity: 0.85 });
      const line = new Line(new BufferGeometry().setFromPoints(points), material);
      line.computeLineDistances();
      line.name = link.key;
      line.renderOrder = 1;
      line.raycast = () => undefined;
      this.overlayGroup.add(line);
      if (link.label) {
        this.addLinkArrows(link, points);
      }
      const direction = to.clone().sub(from);
      if (link.arrow && !link.label && direction.lengthSq() > 0) {
        const head = new Mesh(this.arrowGeometry, new MeshBasicMaterial({ color: link.color, depthTest: false, transparent: true }));
        head.position.copy(to).addScaledVector(direction.normalize(), -0.6);
        head.quaternion.setFromUnitVectors(up, direction);
        head.renderOrder = 2;
        head.raycast = () => undefined;
        this.overlayGroup.add(head);
      }
    }
    for (const marker of markers) {
      const material = new MeshBasicMaterial({ color: marker.color, depthTest: false, transparent: true, opacity: 0.95 });
      const diamond = new Mesh(this.overlayMarkerGeometry, material);
      diamond.name = marker.key;
      diamond.position.copy(scenePoint(marker.position));
      diamond.renderOrder = 3;
      diamond.userData = { overlay: marker.key };
      this.overlayGroup.add(diamond);
      this.overlayMarkers.push(diamond);
    }
  }

  setAreaTriggers(triggers: WorldAreaTrigger[]): void {
    this.triggerGroup.traverse((object) => {
      if (object instanceof Mesh || object instanceof LineSegments) {
        object.geometry.dispose();
      }
    });
    this.triggerGroup.clear();
    for (const trigger of triggers) {
      const geometry = trigger.box
        ? new BoxGeometry(trigger.box.width, trigger.box.height, trigger.box.length)
        : new SphereGeometry(Math.max(trigger.radius, MIN_TRIGGER_RADIUS), 24, 16);
      const mesh = new Mesh(geometry, this.triggerMaterial);
      mesh.name = trigger.key;
      mesh.position.copy(scenePoint(trigger.position));
      mesh.rotation.y = trigger.box ? orientationToSceneYaw(trigger.box.orientation) : 0;
      mesh.userData = { areaTrigger: trigger.key };
      mesh.renderOrder = 2;
      const edges = new LineSegments(new EdgesGeometry(geometry), this.triggerEdgeMaterial);
      edges.raycast = () => undefined;
      mesh.add(edges);
      this.triggerGroup.add(mesh);
    }
  }

  setWaypointPaths(paths: WaypointPath[]): void {
    this.clearGroup(this.waypointGroup);
    for (const path of paths) {
      const color = pathColor(path.key);
      const group = new Group();
      group.name = path.key;

      const linePoints = path.points.map((p) => scenePoint(p.position, WAYPOINT_LIFT));
      const numbers = path.points.map((p) => p.point);
      if (path.closed && linePoints.length > 2) {
        linePoints.push(linePoints[0].clone());
        numbers.push(numbers[0]);
      }
      // Drawn over the terrain so a path stays readable where it crosses a hill between two points.
      const line = new Line(
        new BufferGeometry().setFromPoints(linePoints),
        new LineBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 }),
      );
      line.renderOrder = 1;
      line.name = `${path.key}:line`;
      group.add(line, this.buildArrows(path.key, linePoints, numbers, color));

      for (const waypoint of path.points) {
        const key = waypointKey(path.key, waypoint.point);
        const sphere = new Mesh(this.waypointGeometries.ground, this.waypointMaterial(color));
        sphere.name = key;
        sphere.userData = { key, kind: 'waypoint', pathKey: path.key, point: waypoint.point } satisfies PickableData;
        placeObject(sphere, waypoint.position, waypoint.orientation ?? 0, WAYPOINT_LIFT);
        this.objects.set(key, sphere);
        group.add(sphere);
      }
      this.orientPointers(group, path.closed === true && path.points.length > 2);
      this.waypointGroup.add(group);
    }
    this.waypointPlaces.clear();
    this.classifyWaypoints();
    this.setWaypointChecks(this.waypointChecks);
    this.applySelection();
  }

  /**
   * Where a point is: in a liquid (at or under its surface, with no ceiling in between), in the air (more than
   * `AIR_WAYPOINT_HEIGHT` above the floor or liquid below), or on the ground. Uses what's loaded around the camera.
   */
  waypointPlace(position: WorldPosition): WaypointPlace {
    const floor = this.firstGroundBelow(position.x, position.y, position.z + 0.5);
    const liquid = this.liquidHeightAt(position.x, position.y);
    // a liquid over the floor, not hidden from the point by a ceiling (a cave under a lake)
    const liquidOver =
      liquid !== undefined && (floor === undefined || liquid > floor) && !this.ceilingBetween(position, liquid) ? liquid : undefined;
    if (liquidOver !== undefined && position.z <= liquidOver + 0.5) {
      return 'water';
    }
    // no floor under it but ground above: under the map
    if (
      floor === undefined &&
      liquidOver === undefined &&
      (this.firstGroundBelow(position.x, position.y, 10_000) ?? -Infinity) > position.z
    ) {
      return 'under';
    }
    // nothing loaded under it: taken as ground
    const base = Math.max(floor ?? position.z, liquidOver ?? -Infinity);
    return position.z - base > AIR_WAYPOINT_HEIGHT ? 'air' : 'ground';
  }

  /** The place each waypoint was last drawn for. */
  waypointPlaceOf(key: string): WaypointPlace | undefined {
    return this.waypointPlaces.get(key);
  }

  /**
   * Gives each waypoint the marker of its place (ball, cube or pyramid), with a line down to the floor under the
   * points in the air. Call again when terrain or buildings around them loaded.
   */
  classifyWaypoints(): void {
    this.scene.updateMatrixWorld();
    for (const group of this.waypointGroup.children) {
      const drops: Vector3[] = [];
      for (const waypoint of this.waypointsOf(group as Group)) {
        const key = (waypoint.userData as PickableData).key;
        const position = (this.getObjectState(key) as { position: WorldPosition }).position;
        const place = this.waypointPlace(position);
        this.waypointPlaces.set(key, place);
        (waypoint as Mesh).geometry = this.waypointGeometries[place];
        const floor = place === 'air' ? this.firstGroundBelow(position.x, position.y, position.z) : undefined;
        if (floor !== undefined) {
          const top = scenePoint(position, WAYPOINT_LIFT);
          const bottom = scenePoint({ ...position, z: floor }, 0.05);
          drops.push(top, bottom);
          // a small square on the floor under it
          const corners = [-0.4, 0.4].flatMap((dx) => [-0.4, 0.4].map((dz) => bottom.clone().add(new Vector3(dx, 0, dz))));
          drops.push(corners[0], corners[1], corners[1], corners[3], corners[3], corners[2], corners[2], corners[0]);
        }
      }
      const old = group.getObjectByName(`${group.name}:drops`) as LineSegments | undefined;
      if (old) {
        group.remove(old);
        old.geometry.dispose();
        (old.material as Material).dispose();
      }
      if (drops.length > 0) {
        const lines = new LineSegments(
          new BufferGeometry().setFromPoints(drops),
          new LineBasicMaterial({ color: pathColor(group.name), transparent: true, opacity: 0.7, depthTest: false }),
        );
        lines.name = `${group.name}:drops`;
        lines.renderOrder = 1;
        lines.raycast = () => undefined;
        group.add(lines);
      }
    }
  }

  /** Draws the "Check path" marks (green, yellow or red "!") over the checked waypoints; an empty list removes them. */
  setWaypointChecks(checks: WaypointCheck[]): void {
    this.waypointChecks = checks;
    const marks: Object3D[] = [];
    this.waypointGroup.traverse((object) => object.name === CHECK_MARK_NAME && marks.push(object));
    marks.forEach((mark) => mark.removeFromParent());
    for (const check of checks) {
      const waypoint = this.objects.get(check.key);
      if (!waypoint) {
        continue;
      }
      const mark = new Group();
      mark.name = CHECK_MARK_NAME;
      for (const geometry of [this.checkBarGeometry, this.checkDotGeometry]) {
        const mesh = new Mesh(geometry, this.checkMaterials[check.status]);
        mesh.renderOrder = 3;
        mesh.raycast = () => undefined;
        mark.add(mesh);
      }
      waypoint.add(mark);
    }
  }

  /** Height of the highest liquid surface at a server x/y, if loaded. */
  private liquidHeightAt(x: number, y: number): number | undefined {
    const from = worldToScene({ x, y, z: 10_000 });
    this.liquidRaycaster.layers.set(LIQUID_LAYER);
    this.liquidRaycaster.set(new Vector3(from.x, from.y, from.z), new Vector3(0, -1, 0));
    return this.liquidRaycaster.intersectObjects([this.terrainGroup], true)[0]?.point.y;
  }

  /** Terrain or a building between a point and a height above it (a cave under a lake). */
  private ceilingBetween(position: WorldPosition, height: number): boolean {
    if (height <= position.z) {
      return false;
    }
    const from = scenePoint(position);
    this.raycaster.set(from, new Vector3(0, 1, 0));
    this.raycaster.far = height - position.z;
    const hit = this.raycaster.intersectObjects([this.terrainGroup, this.buildingGroup], true)[0];
    this.raycaster.far = Infinity;
    return hit !== undefined;
  }

  /** Redraws the line and direction arrows of a path after one of its points was moved interactively. */
  refreshPathLine(pathKey: string): void {
    const line = this.waypointGroup.getObjectByName(`${pathKey}:line`) as Line | undefined;
    if (!line) {
      return;
    }
    const group = line.parent as Group;
    const waypoints = this.waypointsOf(group);
    const points = waypoints.map((child) => child.position.clone());
    const numbers = waypoints.map((child) => (child.userData as PickableData).point as number);
    const closed = line.geometry.getAttribute('position').count === points.length + 1;
    if (closed) {
      points.push(points[0].clone());
      numbers.push(numbers[0]);
    }
    this.orientPointers(group, closed);
    this.classifyWaypoints();
    line.geometry.dispose();
    line.geometry = new BufferGeometry().setFromPoints(points);

    const oldArrows = group.getObjectByName(`${pathKey}:arrows`) as Group;
    this.disposeArrows(oldArrows);
    group.remove(oldArrows);
    group.add(this.buildArrows(pathKey, points, numbers, pathColor(pathKey)));
  }

  private waypointsOf(group: Group): Object3D[] {
    return group.children.filter((child) => (child.userData as Partial<PickableData>).kind === 'waypoint');
  }

  /**
   * Gives each waypoint ball a pointer towards the next point (the last one of an open path keeps the direction it
   * was reached from). The ball's own rotation stays the waypoint orientation, so the pointer counter-rotates.
   */
  private orientPointers(group: Group, closed: boolean): void {
    const waypoints = this.waypointsOf(group);
    const up = new Vector3(0, 1, 0);
    waypoints.forEach((waypoint, i) => {
      const old = waypoint.getObjectByName(POINTER_NAME);
      if (old) {
        waypoint.remove(old);
      }
      const next = waypoints[i + 1] ?? (closed ? waypoints[0] : undefined);
      const direction = next
        ? next.position.clone().sub(waypoint.position)
        : waypoint.position.clone().sub(waypoints[i - 1]?.position ?? waypoint.position);
      if (direction.lengthSq() === 0) {
        return;
      }
      const pointer = new Mesh(this.pointerGeometry, (waypoint as Mesh).material);
      pointer.name = POINTER_NAME;
      pointer.userData = waypoint.userData;
      const local = direction.normalize().applyQuaternion(waypoint.quaternion.clone().invert());
      pointer.quaternion.setFromUnitVectors(up, local);
      waypoint.add(pointer);
    });
  }

  /** One arrow per segment, at its middle, pointing towards the next point (the direction the creature walks). */
  private buildArrows(pathKey: string, points: Vector3[], numbers: number[], color: number): Group {
    const arrows = new Group();
    arrows.name = `${pathKey}:arrows`;
    const material = new MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.9 });
    const up = new Vector3(0, 1, 0);
    for (let i = 0; i + 1 < points.length; i++) {
      const direction = points[i + 1].clone().sub(points[i]);
      if (direction.lengthSq() === 0) {
        continue;
      }
      const arrow = new Mesh(this.arrowGeometry, material);
      arrow.position
        .copy(points[i])
        .add(points[i + 1])
        .multiplyScalar(0.5);
      arrow.quaternion.setFromUnitVectors(up, direction.normalize());
      arrow.renderOrder = 2;
      arrow.userData = { segment: { pathKey, from: numbers[i], to: numbers[i + 1] } } satisfies SegmentData;
      arrows.add(arrow);
      this.arrows.add(arrow);
    }
    arrows.userData = { arrowMaterial: material };
    return arrows;
  }

  private disposeArrows(arrows: Group): void {
    arrows.children.forEach((arrow) => this.arrows.delete(arrow));
    (arrows.userData as { arrowMaterial: Material }).arrowMaterial.dispose();
  }

  setSelection(key: string | undefined): void {
    this.selectedKey = key;
    this.applySelection();
  }

  /** Spawns selected along with the main selection (multi-select), highlighted like it. */
  setGroupSelection(keys: string[]): void {
    this.groupKeys = new Set(keys);
    this.applySelection();
  }

  /**
   * A copy of a spawn's marker and model that moves on its own (the movement simulation), without its wander circle;
   * undefined removes it. False when there's no such spawn.
   */
  setGhost(key: string | undefined): boolean {
    this.ghostGroup.clear();
    const source = key ? this.objects.get(key) : undefined;
    if (!source) {
      return false;
    }
    const ghost = source.clone(true);
    ghost.children.filter((child) => child instanceof LineLoop).forEach((ring) => ring.removeFromParent());
    ghost.traverse((object) => {
      object.raycast = () => undefined;
    });
    ghost.name = 'ghost';
    this.ghostGroup.add(ghost);
    return true;
  }

  moveGhost(position: WorldPosition, orientation: number): void {
    const ghost = this.ghostGroup.children[0];
    if (ghost) {
      placeObject(ghost, position, orientation);
    }
  }

  get selection(): string | undefined {
    return this.selectedKey;
  }

  /** Server-space position and orientation of a scene object (waypoint lift removed). */
  getObjectState(key: string): { position: WorldPosition; orientation: number } | undefined {
    const object = this.objects.get(key);
    if (!object) {
      return undefined;
    }
    const lift = (object.userData as PickableData).kind === 'waypoint' ? WAYPOINT_LIFT : 0;
    const position = sceneToWorld({ x: object.position.x, y: object.position.y - lift, z: object.position.z });
    return { position, orientation: sceneYawToOrientation(object.rotation.y) };
  }

  /** One pickable arrow in the middle of each stretch of a labelled link, pointing the way it goes. */
  private addLinkArrows(link: WorldLink, points: Vector3[]): void {
    const up = new Vector3(0, 1, 0);
    const geometry = link.via ? this.flightArrowGeometry : this.arrowGeometry;
    const material = new MeshBasicMaterial({ color: link.color, depthTest: false, transparent: true });
    const stops = [link.from, ...(link.via ?? []), link.to];
    for (let i = 0; i + 1 < points.length; i++) {
      const direction = points[i + 1].clone().sub(points[i]);
      if (direction.lengthSq() === 0) {
        continue;
      }
      const arrow = new Mesh(geometry, material);
      arrow.name = `${link.key}:arrow`;
      arrow.position
        .copy(points[i])
        .add(points[i + 1])
        .multiplyScalar(0.5);
      arrow.quaternion.setFromUnitVectors(up, direction.normalize());
      arrow.renderOrder = 2;
      const [a, b] = [stops[i], stops[i + 1]];
      arrow.userData = { overlay: link.key, direction: Math.atan2(b.y - a.y, b.x - a.x) };
      this.overlayGroup.add(arrow);
      this.overlayMarkers.push(arrow);
    }
  }

  /** Scales markers with their distance to the camera; call before rendering. */
  updateMarkerScale(): void {
    const cameraPosition = this.camera.position;
    this.sky.position.copy(cameraPosition);
    this.sky.scale.setScalar(this.camera.far * 0.9);
    for (const object of [...this.objects.values(), ...this.arrows, ...this.overlayMarkers]) {
      const distance = object.position.distanceTo(cameraPosition);
      const scale = Math.min(MARKER_MAX_SCALE, Math.max(1, distance / MARKER_SCALE_DISTANCE));
      object.scale.setScalar(scale);
      // a model and a wander circle keep their real size whatever the pin's on-screen scaling
      const modelScale = (object.userData as SpawnMarkerData).modelScale;
      if (modelScale !== undefined) {
        object.getObjectByName(SPAWN_MODEL_NAME)?.scale.setScalar(modelScale / scale);
      }
      for (const ring of object.children) {
        if (ring instanceof LineLoop) {
          ring.scale.setScalar((ring.userData as { radius: number }).radius / scale);
        }
      }
    }
  }

  // ---------------------------------------------------------------- picking

  /**
   * Picks at normalised device coordinates (−1..1): markers hit by the ray first, then the marker nearest to the
   * cursor within `tolerance` (in NDC units, so small far-away markers stay clickable), then the ground.
   * `groundOnly` ignores markers (placing things on the terrain); `markersOnly` skips the terrain (hover labels).
   */
  pick(ndcX: number, ndcY: number, options: PickOptions = {}): PickResult | undefined {
    const { tolerance = 0.03, groundOnly = false, markersOnly = false, segments = false } = options;
    this.camera.updateMatrixWorld();
    this.updateMarkerScale();
    this.scene.updateMatrixWorld();
    this.raycaster.setFromCamera(new Vector2(ndcX, ndcY), this.camera);

    const hits = groundOnly ? [] : this.raycaster.intersectObjects([this.spawnGroup, this.waypointGroup], true);
    const markerHit = hits.find(isPickableHit);
    const segmentHit = segments && !markerHit ? hits.find((hit) => 'segment' in hit.object.userData) : undefined;
    if (segmentHit) {
      const { pathKey, from, to } = (segmentHit.object.userData as SegmentData).segment;
      return { type: 'segment', pathKey, from, to, position: sceneToWorld(segmentHit.point) };
    }
    const marker = groundOnly ? undefined : (markerHit?.object ?? this.nearestMarker(ndcX, ndcY, tolerance));
    if (marker) {
      const data = marker.userData as PickableData;
      const state = this.getObjectState(data.key) as { position: WorldPosition };
      return data.kind === 'waypoint'
        ? { type: 'waypoint', key: data.key, pathKey: data.pathKey as string, point: data.point as number, position: state.position }
        : { type: 'spawn', key: data.key, position: state.position };
    }

    const overlayHit = options.overlays ? this.raycaster.intersectObjects(this.overlayMarkers, false)[0] : undefined;
    if (overlayHit) {
      const { overlay, direction } = overlayHit.object.userData as { overlay: string; direction?: number };
      return { type: 'overlay', key: overlay, position: sceneToWorld(overlayHit.point), ...(direction === undefined ? {} : { direction }) };
    }
    const triggerHit = options.areaTriggers ? this.raycaster.intersectObject(this.triggerGroup, true)[0] : undefined;
    if (triggerHit) {
      return { type: 'areatrigger', key: triggerHit.object.userData['areaTrigger'] as string, position: sceneToWorld(triggerHit.point) };
    }
    const groundHit = markersOnly ? undefined : this.raycaster.intersectObjects([this.terrainGroup, this.buildingGroup], true)[0];
    return groundHit ? { type: 'ground', position: sceneToWorld(groundHit.point) } : undefined;
  }

  /** Marker whose on-screen position is nearest to the cursor, if within `tolerance` and in front of the camera. */
  private nearestMarker(ndcX: number, ndcY: number, tolerance: number): Object3D | undefined {
    let best: Object3D | undefined;
    let bestDistance = tolerance;
    const projected = new Vector3();
    this.objects.forEach((object) => {
      projected.copy(object.position).project(this.camera);
      const distance = Math.hypot(projected.x - ndcX, projected.y - ndcY);
      if (projected.z < 1 && distance <= bestDistance) {
        best = object;
        bestDistance = distance;
      }
    });
    return best;
  }

  /**
   * Height of the ground (terrain or building floor) under a server x/y, if loaded. With `fromZ`, the first surface
   * below that height (plus a step, so stairs can be climbed) wins: inside a building that's the floor, not the roof.
   * Without one, or with nothing below, the highest surface.
   */
  groundHeightAt(x: number, y: number, fromZ?: number): number | undefined {
    const below = fromZ === undefined ? undefined : this.firstGroundBelow(x, y, fromZ + GROUND_STEP);
    return below ?? this.firstGroundBelow(x, y, 10_000);
  }

  /**
   * The nearest building wall around a point (within `WALL_SNAP_DISTANCE`, at the given height + 1 yard): where to
   * stand against it and the orientation facing away from it, for torches, banners or NPCs leaning on a wall.
   */
  wallSnap(x: number, y: number, z: number): { position: WorldPosition; orientation: number } | undefined {
    const origin = scenePoint({ x, y, z: z + 1 });
    // buildings streamed in since the last frame have no world matrix yet
    this.buildingGroup.updateMatrixWorld();
    let best: Intersection | undefined;
    for (let i = 0; i < WALL_SNAP_DIRECTIONS; i++) {
      const angle = (i / WALL_SNAP_DIRECTIONS) * Math.PI * 2;
      this.raycaster.set(origin, new Vector3(Math.cos(angle), 0, Math.sin(angle)));
      this.raycaster.far = WALL_SNAP_DISTANCE;
      const hit = this.raycaster.intersectObjects([this.buildingGroup], true)[0];
      if (hit && (!best || hit.distance < best.distance)) {
        best = hit;
      }
    }
    this.raycaster.far = Infinity;
    if (!best?.face) {
      return undefined;
    }
    const normal = best.face.normal.clone().transformDirection(best.object.matrixWorld).setY(0);
    // faces seen from behind (thin walls, inside of a hut): face the side the point is on
    if (normal.dot(origin.clone().sub(best.point)) < 0) {
      normal.negate();
    }
    normal.normalize();
    const point = best.point.clone().addScaledVector(normal, WALL_SNAP_GAP);
    const position = sceneToWorld({ x: point.x, y: point.y - 1, z: point.z });
    // the scene yaw whose forward (−z) points along the normal
    return { position, orientation: sceneYawToOrientation(Math.atan2(-normal.x, -normal.z)) };
  }

  private firstGroundBelow(x: number, y: number, z: number): number | undefined {
    const from = worldToScene({ x, y, z });
    this.raycaster.set(new Vector3(from.x, from.y, from.z), new Vector3(0, -1, 0));
    const hit = this.raycaster.intersectObjects([this.terrainGroup, this.buildingGroup], true)[0];
    return hit ? hit.point.y : undefined;
  }

  dispose(): void {
    this.clearTerrain();
    this.clearGroup(this.spawnGroup);
    this.clearGroup(this.waypointGroup);
    this.creatureGeometry.dispose();
    this.gameobjectGeometry.dispose();
    Object.values(this.waypointGeometries).forEach((geometry) => geometry.dispose());
    this.checkBarGeometry.dispose();
    this.checkDotGeometry.dispose();
    Object.values(this.checkMaterials).forEach((material) => material.dispose());
    this.arrowGeometry.dispose();
    this.flightArrowGeometry.dispose();
    this.pointerGeometry.dispose();
    this.ringGeometry.dispose();
    this.wanderMaterial.dispose();
    this.boundingMaterial.dispose();
    this.reachMaterial.dispose();
    this.facingArrowGeometry.dispose();
    Object.values(this.facingArrowMaterials).forEach((material) => material.dispose());
    this.setAreaTriggers([]);
    this.setOverlays([], []);
    this.overlayMarkerGeometry.dispose();
    this.triggerMaterial.dispose();
    this.triggerEdgeMaterial.dispose();
    this.beacon.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        (object.material as Material).dispose();
      }
    });
    this.markerMaterials.forEach((material) => material.dispose());
    this.hiddenMarkerMaterial.dispose();
    this.sky.geometry.dispose();
    this.sky.material.dispose();
    this.liquidMaterials.forEach((material) => material.dispose());
    this.markerMaterials.clear();
  }

  // ---------------------------------------------------------------- internals

  private addObject(group: Group, key: string, object: Object3D): void {
    this.objects.set(key, object);
    group.add(object);
  }

  private clearGroup(group: Group): void {
    group.traverse((object) => {
      const key = (object.userData as Partial<PickableData>).key;
      if (key) {
        this.objects.delete(key);
      }
      // the rings around spawns share their geometry and materials
      if (object instanceof Line && object.geometry !== this.ringGeometry) {
        object.geometry.dispose();
        (object.material as Material).dispose();
      }
      if (object.name.endsWith(':arrows')) {
        this.disposeArrows(object as Group);
      }
    });
    group.clear();
  }

  private markerMaterial(kind: SpawnKind | 'waypoint', state: MarkerState, color?: number): MeshLambertMaterial {
    const id = `${kind}:${state}:${color ?? ''}`;
    let material = this.markerMaterials.get(id);
    if (!material) {
      const base = color ?? COLORS[kind as SpawnKind];
      material = new MeshLambertMaterial({
        color: state === 'selected' ? COLORS.selected : base,
        emissive: state === 'selected' ? COLORS.selected : 0x000000,
        emissiveIntensity: state === 'selected' ? 0.6 : 0,
        transparent: state === 'pending',
        opacity: state === 'pending' ? 0.6 : 1,
      });
      this.markerMaterials.set(id, material);
    }
    return material;
  }

  private waypointMaterial(color: number, selected = false): MeshLambertMaterial {
    return this.markerMaterial('waypoint', selected ? 'selected' : 'normal', color);
  }

  private applySelection(): void {
    this.objects.forEach((object, key) => {
      const mesh = object as Mesh;
      const data = object.userData as PickableData & SpawnMarkerData;
      const selected = key === this.selectedKey || this.groupKeys.has(key);
      if (data.kind === 'waypoint') {
        mesh.material = this.waypointMaterial(pathColor(data.pathKey as string), selected);
        const pointer = object.getObjectByName(POINTER_NAME) as Mesh | undefined;
        if (pointer) {
          pointer.material = mesh.material;
        }
      } else if (data.modelScale !== undefined && !selected) {
        mesh.material = this.hiddenMarkerMaterial;
      } else {
        mesh.material = this.markerMaterial(data.kind, selected ? 'selected' : data.pending ? 'pending' : 'normal');
      }
    });
  }
}

function createBeacon(): Group {
  const material = new MeshBasicMaterial({ color: 0xfff35c, transparent: true, opacity: 0.55, depthTest: false });
  const beam = new Mesh(new CylinderGeometry(0.25, 0.25, 80, 8).translate(0, 40, 0), material);
  const ring = new Mesh(new RingGeometry(1.2, 1.6, 32).rotateX(-Math.PI / 2).translate(0, 0.2, 0), material.clone());
  const beacon = new Group();
  beacon.name = 'beacon';
  beacon.add(beam, ring);
  beacon.renderOrder = 4;
  beam.renderOrder = 4;
  ring.renderOrder = 4;
  beacon.visible = false;
  return beacon;
}

function scenePoint(position: WorldPosition, lift = 0): Vector3 {
  const p = worldToScene(position);
  return new Vector3(p.x, p.y + lift, p.z);
}

function placeObject(object: Object3D, position: WorldPosition, orientation: number, lift = 0): void {
  object.position.copy(scenePoint(position, lift));
  object.rotation.set(0, orientationToSceneYaw(orientation), 0);
}

function isPickableHit(hit: Intersection): boolean {
  return typeof (hit.object.userData as Partial<PickableData>).key === 'string';
}

/** Disposes a terrain mesh with its own textures (minimap or alpha map), keeping shared tileset textures. */
function disposeTerrainMesh(mesh: Mesh): void {
  mesh.geometry.dispose();
  const material = mesh.material as MeshLambertMaterial | ShaderMaterial;
  if (material.userData['shared']) {
    return;
  }
  if (material instanceof ShaderMaterial) {
    const splat = material.uniforms['splat'].value as Texture;
    if (splat.userData['ownedByChunk']) {
      splat.dispose();
    }
  } else {
    (material.map as Texture | null)?.dispose();
  }
  material.dispose();
}

function createSplatTexture(data: Uint8Array): DataTexture {
  const texture = new DataTexture(data, SPLAT_SIZE, SPLAT_SIZE, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.userData['ownedByChunk'] = true;
  texture.needsUpdate = true;
  return texture;
}
