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
  Fog,
  Group,
  HemisphereLight,
  Intersection,
  Line,
  LineBasicMaterial,
  LineLoop,
  LinearFilter,
  LinearMipmapLinearFilter,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  Raycaster,
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
import { createTerrainLighting, createTerrainMaterial } from './terrain-material';
import { PickResult, SpawnKind, WaypointPath, waypointKey, WorldSpawn } from './world-viewer.model';

type MarkerState = 'normal' | 'pending' | 'selected';

export interface PickOptions {
  /** How far (in normalised device units) from the cursor a marker may be and still be picked. */
  tolerance?: number;
  groundOnly?: boolean;
  markersOnly?: boolean;
  /** Also pick the direction arrows of paths (hover labels), as `segment` results. */
  segments?: boolean;
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

const COLORS = {
  sky: 0x9cc3e6,
  creature: 0xff9f1c,
  gameobject: 0x2ec4f1,
  selected: 0xfff35c,
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
  private readonly waypointGeometry = new SphereGeometry(0.5, 12, 8);
  private readonly arrowGeometry = new ConeGeometry(0.4, 1.2, 8);
  /** Unit-length arrow along −z from the origin (shaft and head), scaled to each model. */
  private readonly facingArrowGeometry = mergeGeometries([
    new CylinderGeometry(0.03, 0.03, 0.7, 6).rotateX(Math.PI / 2).translate(0, 0, -0.35),
    new ConeGeometry(0.09, 0.3, 8).rotateX(-Math.PI / 2).translate(0, 0, -0.85),
  ]);
  private readonly facingArrowMaterial = new MeshBasicMaterial({ color: 0x00e5ff, depthTest: false, transparent: true, opacity: 0.9 });
  private facingArrowsVisible = true;
  /** Unit circle on the ground (scaled to each creature's wander distance). */
  private readonly ringGeometry = new BufferGeometry().setFromPoints(
    Array.from({ length: 64 }, (_, i) => new Vector3(Math.cos((i / 64) * Math.PI * 2), 0.3, Math.sin((i / 64) * Math.PI * 2))),
  );
  private readonly wanderMaterial = new LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.8 });
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
    this.scene.add(this.terrainGroup, this.buildingGroup, this.doodadGroup, this.spawnGroup, this.waypointGroup);
    this.camera.layers.enable(LIQUID_LAYER);
    this.setRoofsVisible(true);

    this.sun.position.set(300, 600, 200);
    this.scene.add(this.hemisphere, this.ambient, this.sun, this.sky);
  }

  /** Shows building roofs, or hides them to look inside (hidden roofs are not picked either, so clicks reach the floor). */
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
      if (spawn.wanderRadius) {
        const ring = new LineLoop(this.ringGeometry, this.wanderMaterial);
        ring.name = WANDER_RING_NAME;
        ring.userData = { radius: spawn.wanderRadius };
        ring.raycast = () => undefined;
        marker.add(ring);
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
        model.add(this.facingArrowFor(model));
      }
      // hits on the model pick the spawn
      model.traverse((object) => (object.userData = data));
      marker.add(model);
    }
    data.modelScale = model ? scale : undefined;
    this.applySelection();
    return true;
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
  private facingArrowFor(model: Object3D): Mesh {
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const arrow = new Mesh(this.facingArrowGeometry, this.facingArrowMaterial);
    arrow.name = FACING_ARROW_NAME;
    box.getCenter(arrow.position);
    arrow.scale.setScalar(Math.max(size.x, size.z, 0.5));
    arrow.renderOrder = 3;
    arrow.raycast = () => undefined;
    arrow.visible = this.facingArrowsVisible;
    return arrow;
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
        const sphere = new Mesh(this.waypointGeometry, this.waypointMaterial(color));
        sphere.name = key;
        sphere.userData = { key, kind: 'waypoint', pathKey: path.key, point: waypoint.point } satisfies PickableData;
        placeObject(sphere, waypoint.position, waypoint.orientation ?? 0, WAYPOINT_LIFT);
        this.objects.set(key, sphere);
        group.add(sphere);
      }
      this.orientPointers(group, path.closed === true && path.points.length > 2);
      this.waypointGroup.add(group);
    }
    this.applySelection();
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

  /** Scales markers with their distance to the camera; call before rendering. */
  updateMarkerScale(): void {
    const cameraPosition = this.camera.position;
    this.sky.position.copy(cameraPosition);
    this.sky.scale.setScalar(this.camera.far * 0.9);
    for (const object of [...this.objects.values(), ...this.arrows]) {
      const distance = object.position.distanceTo(cameraPosition);
      const scale = Math.min(MARKER_MAX_SCALE, Math.max(1, distance / MARKER_SCALE_DISTANCE));
      object.scale.setScalar(scale);
      // a model and a wander circle keep their real size whatever the pin's on-screen scaling
      const modelScale = (object.userData as SpawnMarkerData).modelScale;
      if (modelScale !== undefined) {
        object.getObjectByName(SPAWN_MODEL_NAME)?.scale.setScalar(modelScale / scale);
      }
      const ring = object.getObjectByName(WANDER_RING_NAME);
      if (ring) {
        ring.scale.setScalar((ring.userData as { radius: number }).radius / scale);
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
    this.waypointGeometry.dispose();
    this.arrowGeometry.dispose();
    this.pointerGeometry.dispose();
    this.ringGeometry.dispose();
    this.wanderMaterial.dispose();
    this.facingArrowGeometry.dispose();
    this.facingArrowMaterial.dispose();
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
      if (object instanceof Line && object.name !== WANDER_RING_NAME) {
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
      const selected = key === this.selectedKey;
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
