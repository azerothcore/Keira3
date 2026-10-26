import {
  AmbientLight,
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
import { createTerrainLighting, createTerrainMaterial } from './terrain-material';
import { PickResult, SpawnKind, WaypointPath, waypointKey, WorldSpawn } from './world-viewer.model';

type MarkerState = 'normal' | 'pending' | 'selected';

export interface PickOptions {
  /** How far (in normalised device units) from the cursor a marker may be and still be picked. */
  tolerance?: number;
  groundOnly?: boolean;
  markersOnly?: boolean;
}

interface PickableData {
  key: string;
  kind: SpawnKind | 'waypoint';
  pathKey?: string;
  point?: number;
}

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
  private readonly spawnGroup = new Group();
  private readonly waypointGroup = new Group();
  private readonly raycaster = new Raycaster();

  private readonly terrainTiles = new Map<string, Object3D>();
  /** Sun and ambient light of the textured terrain (updated by zone lighting). */
  readonly terrainLighting = createTerrainLighting();
  private readonly liquidMaterials = new Map<LiquidKind, MeshLambertMaterial>();
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
  private readonly arrows = new Set<Object3D>();
  private readonly markerMaterials = new Map<string, MeshLambertMaterial>();

  constructor() {
    this.scene.background = new Color(COLORS.sky);
    this.scene.fog = new Fog(COLORS.sky, 600, 1600);
    this.terrainGroup.name = 'terrain';
    this.buildingGroup.name = 'buildings';
    this.spawnGroup.name = 'spawns';
    this.waypointGroup.name = 'waypoints';
    this.scene.add(this.terrainGroup, this.buildingGroup, this.spawnGroup, this.waypointGroup);
    this.camera.layers.enable(LIQUID_LAYER);

    const sun = new DirectionalLight(0xffffff, 1.6);
    sun.position.set(300, 600, 200);
    this.scene.add(new HemisphereLight(0xdbeeff, 0x4a3b2a, 1.2), new AmbientLight(0xffffff, 0.35), sun);
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
      const look: Record<LiquidKind, [number, number]> = {
        water: [0x2a6b9c, 0.65],
        ocean: [0x1d4f7a, 0.75],
        magma: [0xff5a1f, 0.95],
        slime: [0x5fbf3a, 0.85],
      };
      const [color, opacity] = look[kind];
      material = new MeshLambertMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        side: DoubleSide,
        emissive: kind === 'magma' ? 0xff3300 : 0x000000,
        emissiveIntensity: kind === 'magma' ? 0.8 : 0,
      });
      material.userData['shared'] = true;
      this.liquidMaterials.set(kind, material);
    }
    return material;
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
      this.addObject(this.spawnGroup, spawn.key, marker);
    }
    this.applySelection();
  }

  setWaypointPaths(paths: WaypointPath[]): void {
    this.clearGroup(this.waypointGroup);
    for (const path of paths) {
      const color = pathColor(path.key);
      const group = new Group();
      group.name = path.key;

      const linePoints = path.points.map((p) => scenePoint(p.position, WAYPOINT_LIFT));
      if (path.closed && linePoints.length > 2) {
        linePoints.push(linePoints[0].clone());
      }
      // Drawn over the terrain so a path stays readable where it crosses a hill between two points.
      const line = new Line(
        new BufferGeometry().setFromPoints(linePoints),
        new LineBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 }),
      );
      line.renderOrder = 1;
      line.name = `${path.key}:line`;
      group.add(line, this.buildArrows(path.key, linePoints, color));

      for (const waypoint of path.points) {
        const key = waypointKey(path.key, waypoint.point);
        const sphere = new Mesh(this.waypointGeometry, this.waypointMaterial(color));
        sphere.name = key;
        sphere.userData = { key, kind: 'waypoint', pathKey: path.key, point: waypoint.point } satisfies PickableData;
        placeObject(sphere, waypoint.position, waypoint.orientation ?? 0, WAYPOINT_LIFT);
        this.objects.set(key, sphere);
        group.add(sphere);
      }
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
    const points = group.children
      .filter((child) => (child.userData as Partial<PickableData>).kind === 'waypoint')
      .map((child) => child.position.clone());
    if (line.geometry.getAttribute('position').count === points.length + 1) {
      points.push(points[0].clone());
    }
    line.geometry.dispose();
    line.geometry = new BufferGeometry().setFromPoints(points);

    const oldArrows = group.getObjectByName(`${pathKey}:arrows`) as Group;
    this.disposeArrows(oldArrows);
    group.remove(oldArrows);
    group.add(this.buildArrows(pathKey, points, pathColor(pathKey)));
  }

  /** One arrow per segment, at its middle, pointing towards the next point (the direction the creature walks). */
  private buildArrows(pathKey: string, points: Vector3[], color: number): Group {
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
    for (const object of [...this.objects.values(), ...this.arrows]) {
      const distance = object.position.distanceTo(cameraPosition);
      object.scale.setScalar(Math.min(MARKER_MAX_SCALE, Math.max(1, distance / MARKER_SCALE_DISTANCE)));
    }
  }

  // ---------------------------------------------------------------- picking

  /**
   * Picks at normalised device coordinates (−1..1): markers hit by the ray first, then the marker nearest to the
   * cursor within `tolerance` (in NDC units, so small far-away markers stay clickable), then the ground.
   * `groundOnly` ignores markers (placing things on the terrain); `markersOnly` skips the terrain (hover labels).
   */
  pick(ndcX: number, ndcY: number, options: PickOptions = {}): PickResult | undefined {
    const { tolerance = 0.03, groundOnly = false, markersOnly = false } = options;
    this.camera.updateMatrixWorld();
    this.updateMarkerScale();
    this.scene.updateMatrixWorld();
    this.raycaster.setFromCamera(new Vector2(ndcX, ndcY), this.camera);

    const markerHit = groundOnly
      ? undefined
      : this.raycaster.intersectObjects([this.spawnGroup, this.waypointGroup], true).find(isPickableHit);
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

  /** Terrain height under a server x/y, if that tile is loaded. */
  groundHeightAt(x: number, y: number): number | undefined {
    const from = worldToScene({ x, y, z: 10_000 });
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
    this.markerMaterials.forEach((material) => material.dispose());
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
      if (object instanceof Line) {
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
      const data = object.userData as PickableData & { pending?: boolean };
      const selected = key === this.selectedKey;
      if (data.kind === 'waypoint') {
        mesh.material = this.waypointMaterial(pathColor(data.pathKey as string), selected);
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
