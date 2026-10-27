import { tileCenter, worldToScene, WorldPosition } from '@keira/shared/wow-data';
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Fog,
  Group,
  Line,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  Vector3,
} from 'three';
import { flatDetail, flatTile } from './world-viewer.mock';
import { COLLISION_LAYER } from './collision-object';
import { pathColor, WorldScene } from './world-scene';
import { WaypointPath, WorldSpawn } from './world-viewer.model';

const CENTER = tileCenter({ tx: 32, ty: 48 });

const spawn = (key: string, kind: 'creature' | 'gameobject', position: WorldPosition, extra: Partial<WorldSpawn> = {}): WorldSpawn => ({
  key,
  kind,
  guid: 1,
  entry: 2,
  label: key,
  position,
  orientation: 0,
  ...extra,
});

const at = (dx: number, dy: number, z = 50): WorldPosition => ({ x: CENTER.x + dx, y: CENTER.y + dy, z });

/** Points the camera straight down at a world position. */
function lookDownAt(world: WorldScene, position: WorldPosition, height = 100): void {
  const p = worldToScene(position);
  world.camera.position.set(p.x, p.y + height, p.z);
  world.camera.lookAt(p.x, p.y, p.z);
}

describe('pathColor', () => {
  it('is stable per key', () => {
    expect(pathColor('path:1')).toBe(pathColor('path:1'));
    expect(typeof pathColor('')).toBe('number');
  });
});

describe('WorldScene', () => {
  describe('terrain', () => {
    it('adds, replaces and removes tiles', () => {
      const world = new WorldScene();
      world.setTerrainTile(flatTile());
      expect(world.terrainKeys).toEqual(['32_48']);
      expect(world.hasTerrainTile('32_48')).toBe(true);

      const image = { width: 1, height: 1, data: new Uint8Array([255, 0, 0, 255]) };
      world.setTerrainTile(flatTile(), image);
      expect(world.terrainKeys).toEqual(['32_48']);
      const tile = world.scene.getObjectByName('tile:32_48') as Mesh;
      expect((tile.material as MeshLambertMaterial).map).toBeTruthy();

      world.removeTerrainTile('nope');
      world.clearTerrain();
      expect(world.terrainKeys).toEqual([]);
    });

    it('builds textured tiles with liquids, and disposes owned textures only', () => {
      const world = new WorldScene();
      const fallback = new Texture();
      const shared = new Texture();
      const liquid = {
        type: 1,
        kind: 'water' as const,
        positions: new Float32Array([0, 50, 0, 1, 50, 0, 0, 50, 1]),
        indices: new Uint16Array([0, 2, 1]),
      };
      const magma = { ...liquid, kind: 'magma' as const };
      const detail = flatDetail(42);
      world.setTerrainTileDetailed(
        { tx: 32, ty: 48 },
        detail.chunks.map((mesh, i) => ({ mesh: i === 0 ? { ...mesh, splat: undefined } : mesh, layers: [shared, shared] })),
        fallback,
        [liquid, magma, liquid],
      );
      const tile = world.scene.getObjectByName('tile:32_48') as Group;
      expect(tile.children.length).toBe(256 + 3);
      expect(world.groundHeightAt(CENTER.x, CENTER.y)).toBeCloseTo(42);
      const water = tile.children.filter((c) => c.name === 'liquid') as Mesh[];
      expect(water[0].material).toBe(water[2].material);
      expect(water[0].material).not.toBe(water[1].material);

      const sharedDispose = vi.spyOn(shared, 'dispose');
      const splat = ((tile.children[1] as Mesh).material as ShaderMaterial).uniforms['splat'].value as Texture;
      const splatDispose = vi.spyOn(splat, 'dispose');
      world.setTerrainTileDetailed({ tx: 32, ty: 48 }, [], fallback);
      expect(splatDispose).toHaveBeenCalled();
      expect(sharedDispose).not.toHaveBeenCalled();
      world.dispose();
    });

    it('treats buildings as ground', () => {
      const world = new WorldScene();
      world.setTerrainTile(flatTile(10));
      const roof = new Mesh(
        new BufferGeometry().setFromPoints([new Vector3(-1000, 0, -1000), new Vector3(1000, 0, -1000), new Vector3(0, 0, 1000)]),
      );
      roof.geometry.setIndex([0, 2, 1]);
      const p = worldToScene({ ...CENTER, z: 30 });
      roof.position.set(p.x, 30, p.z);
      world.buildingGroup.add(roof);
      roof.updateMatrixWorld();
      expect(world.groundHeightAt(CENTER.x, CENTER.y)).toBeCloseTo(30);
      lookDownAt(world, { ...CENTER, z: 30 });
      expect(world.pick(0, 0)?.position.z).toBeCloseTo(30);

      // from inside the building (under the roof) the floor below wins; from above it, the roof
      expect(world.groundHeightAt(CENTER.x, CENTER.y, 15)).toBeCloseTo(10);
      expect(world.groundHeightAt(CENTER.x, CENTER.y, 29)).toBeCloseTo(30);
      expect(world.groundHeightAt(CENTER.x, CENTER.y, 50)).toBeCloseTo(30);
      // below everything: the highest surface
      expect(world.groundHeightAt(CENTER.x, CENTER.y, -100)).toBeCloseTo(30);
    });

    it('hides roofs from view and from picking when asked', () => {
      const world = new WorldScene();
      world.setTerrainTile(flatTile(10));
      const roof = new Mesh(
        new BufferGeometry().setFromPoints([new Vector3(-1000, 0, -1000), new Vector3(1000, 0, -1000), new Vector3(0, 0, 1000)]),
      );
      roof.geometry.setIndex([0, 2, 1]);
      roof.layers.set(2);
      const p = worldToScene({ ...CENTER, z: 30 });
      roof.position.set(p.x, 30, p.z);
      world.buildingGroup.add(roof);
      roof.updateMatrixWorld();
      expect(world.groundHeightAt(CENTER.x, CENTER.y)).toBeCloseTo(30);
      expect(world.camera.layers.isEnabled(2)).toBe(true);
      world.setRoofsVisible(false);
      expect(world.camera.layers.isEnabled(2)).toBe(false);
      expect(world.groundHeightAt(CENTER.x, CENTER.y)).toBeCloseTo(10);
    });

    it('finds the nearest wall and the orientation facing away from it', () => {
      const world = new WorldScene();
      // a wall 3 yards east (server −y) of CENTER: the plane scene x = −(CENTER.y − 3), seen from both sides
      const wall = new Mesh(
        new BufferGeometry().setFromPoints([
          new Vector3(0, -50, -20),
          new Vector3(0, 50, -20),
          new Vector3(0, -50, 20),
          new Vector3(0, 50, 20),
        ]),
      );
      wall.geometry.setIndex([0, 1, 2, 2, 1, 3]);
      wall.geometry.computeVertexNormals();
      const p = worldToScene({ ...CENTER, y: CENTER.y - 3, z: 30 });
      wall.position.set(p.x, 30, p.z);
      world.buildingGroup.add(wall);
      wall.updateMatrixWorld();
      wall.material = new MeshLambertMaterial({ side: 2 });

      const snap = world.wallSnap(CENTER.x, CENTER.y, 30);
      expect(snap?.position.y).toBeCloseTo(CENTER.y - 3 + 0.1, 3);
      expect(snap?.position.x).toBeCloseTo(CENTER.x, 3);
      expect(snap?.position.z).toBeCloseTo(30, 3);
      // facing west (+y), away from the wall
      expect(snap?.orientation).toBeCloseTo(Math.PI / 2, 3);
      // from the other side, facing east
      expect(world.wallSnap(CENTER.x, CENTER.y - 6, 30)?.orientation).toBeCloseTo((3 * Math.PI) / 2, 3);
      expect(world.wallSnap(CENTER.x, CENTER.y + 20, 30)).toBeUndefined();
    });

    it('reports the ground height under a position', () => {
      const world = new WorldScene();
      world.setTerrainTile(flatTile(42));
      expect(world.groundHeightAt(CENTER.x, CENTER.y)).toBeCloseTo(42);
      expect(world.groundHeightAt(0, 0)).toBeUndefined();
    });
  });

  describe('spawns', () => {
    it('places markers in scene coordinates, facing their orientation', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0), { orientation: 1 }), spawn('gameobject:2', 'gameobject', at(5, 5))]);

      expect(world.objectKeys).toEqual(['creature:1', 'gameobject:2']);
      const marker = world.getObject('creature:1') as Mesh;
      const expected = worldToScene(at(0, 0));
      expect(marker.position.x).toBeCloseTo(expected.x);
      expect(marker.position.y).toBeCloseTo(expected.y);
      expect(marker.position.z).toBeCloseTo(expected.z);
      expect(marker.rotation.y).toBe(1);
      expect(world.getObjectState('creature:1')?.orientation).toBe(1);
      expect(world.getObjectState('missing')).toBeUndefined();
    });

    it('replaces previous spawns', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0))]);
      world.setSpawns([spawn('creature:3', 'creature', at(0, 0))]);
      expect(world.objectKeys).toEqual(['creature:3']);
    });

    it('draws pending spawns translucent and highlights the selection', () => {
      const world = new WorldScene();
      world.setSelection('creature:1');
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0)), spawn('creature:2', 'creature', at(1, 1), { pending: true })]);

      const selected = (world.getObject('creature:1') as Mesh).material as MeshLambertMaterial;
      const pending = (world.getObject('creature:2') as Mesh).material as MeshLambertMaterial;
      expect(world.selection).toBe('creature:1');
      expect(selected.emissiveIntensity).toBeGreaterThan(0);
      expect(pending.transparent).toBe(true);

      world.setSelection('creature:2');
      expect(((world.getObject('creature:1') as Mesh).material as MeshLambertMaterial).emissiveIntensity).toBe(0);
      expect(((world.getObject('creature:2') as Mesh).material as MeshLambertMaterial).emissiveIntensity).toBeGreaterThan(0);
    });

    it('draws a spawn with its model instead of its pin, at the model size', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0)), spawn('creature:2', 'creature', at(5000, 0))]);
      world.setWaypointPaths([{ key: 'path:1', label: 'Path 1', points: [{ point: 1, position: at(9, 9) }] }]);
      const model = new Mesh(new BoxGeometry(2, 2, 2), new MeshLambertMaterial());
      const far = new Group();
      far.add(new Mesh(new BoxGeometry(), new MeshLambertMaterial()));
      expect(world.setSpawnModel('creature:1', model, 1.5)).toBe(true);
      expect(world.setSpawnModel('creature:2', far, 2)).toBe(true);
      expect(world.setSpawnModel('nope', model)).toBe(false);
      expect(world.setSpawnModel(world.objectKeys.find((k) => k.startsWith('path')) as string, model)).toBe(false);

      const marker = world.getObject('creature:1') as Mesh;
      expect(model.parent).toBe(marker);
      expect((marker.material as MeshLambertMaterial).visible).toBe(false);
      expect((far.children[0].userData as { key: string }).key).toBe('creature:2');

      // the model keeps its size while the pin scales with distance
      lookDownAt(world, at(0, 0), 10);
      world.updateMarkerScale();
      expect(model.scale.x).toBe(1.5);
      expect(far.scale.x).toBe(2 / 8);

      // selected: the pin is shown highlighted with the model
      world.setSelection('creature:1');
      expect((marker.material as MeshLambertMaterial).visible).toBe(true);

      // replacing and removing the model
      const other = new Mesh(new BoxGeometry(), new MeshLambertMaterial());
      world.setSpawnModel('creature:1', other);
      expect(model.parent).toBeNull();
      world.setSpawnModel('creature:1', other);
      expect(other.parent).toBe(marker);
      world.setSelection(undefined);
      world.setSpawnModel('creature:1', undefined);
      expect(other.parent).toBeNull();
      expect((marker.material as MeshLambertMaterial).visible).toBe(true);
    });

    it('puts a facing arrow through the middle of models, which can be hidden', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0)), spawn('creature:2', 'creature', at(5, 0))]);
      const model = new Mesh(new BoxGeometry(2, 4, 1).translate(0, 2, 0), new MeshLambertMaterial());
      world.setSpawnModel('creature:1', model);
      const arrow = model.getObjectByName('facing') as Mesh;
      expect(arrow.position.toArray()).toEqual([0, 2, 0]);
      expect(arrow.scale.x).toBe(2);
      expect(arrow.visible).toBe(true);
      // re-attaching keeps a single arrow
      world.setSpawnModel('creature:1', model);
      expect(model.children.filter((c) => c.name === 'facing')).toHaveLength(1);

      world.setFacingArrowsVisible(false);
      expect(arrow.visible).toBe(false);
      const later = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshLambertMaterial());
      world.setSpawnModel('creature:2', later);
      expect((later.getObjectByName('facing') as Mesh).visible).toBe(false);
      expect((later.getObjectByName('facing') as Mesh).scale.x).toBe(0.5);
    });

    it('colours the facing arrows like the pins of their kind', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0)), spawn('gameobject:2', 'gameobject', at(5, 0))]);
      const creature = new Mesh(new BoxGeometry(1, 1, 1), new MeshLambertMaterial());
      const gameobject = new Mesh(new BoxGeometry(1, 1, 1), new MeshLambertMaterial());
      world.setSpawnModel('creature:1', creature);
      world.setSpawnModel('gameobject:2', gameobject);
      const color = (model: Mesh): number => ((model.getObjectByName('facing') as Mesh).material as MeshBasicMaterial).color.getHex();
      expect(color(creature)).toBe(0xff9f1c);
      expect(color(gameobject)).toBe(0x2ec4f1);
    });

    it('checks the line of sight against the terrain and the collision of buildings and models, not their looks', () => {
      const world = new WorldScene();
      world.setTerrainTile(flatTile(10));
      const at2 = (dx: number, z: number) => ({ x: CENTER.x + dx, y: CENTER.y, z });
      expect(world.lineOfSightBlock(at2(0, 12), at2(20, 12))).toBeUndefined();
      expect(world.lineOfSightBlock(at2(0, 12), at2(0, 12))).toBeUndefined();
      // through the ground
      expect(world.lineOfSightBlock(at2(0, 12), at2(20, 5))?.z).toBeCloseTo(10, 0);

      // a wall 10 yards north: its drawn mesh doesn't block, its collision does
      const wall = new Mesh(new BoxGeometry(10, 20, 1), new MeshBasicMaterial());
      wall.position.copy(new Vector3(worldToScene(at2(10, 0)).x, 10, worldToScene(at2(10, 0)).z));
      world.buildingGroup.add(wall);
      expect(world.lineOfSightBlock(at2(0, 12), at2(20, 12))).toBeUndefined();
      const collision = new Mesh(wall.geometry, new MeshBasicMaterial());
      collision.layers.set(COLLISION_LAYER);
      wall.add(collision);
      expect(world.lineOfSightBlock(at2(0, 12), at2(20, 12))?.x).toBeCloseTo(CENTER.x + 9.5);
    });

    it('draws the Path / LOS probe and clears it', () => {
      const world = new WorldScene();
      const p = (dx: number) => at(dx, 0);
      world.setProbe({ from: p(0) });
      expect(world.probeGroup.children).toHaveLength(1);
      world.setProbe({
        from: p(0),
        to: p(10),
        path: [p(0), p(5), p(10)],
        sight: { from: p(0), to: p(10), blockedAt: p(4) },
        attackFrom: p(6),
      });
      // path, sight up to the block, hidden rest, block dot, A, C, attack dot, attack line
      expect(world.probeGroup.children).toHaveLength(8);
      world.setProbe({ from: p(0), to: p(10), sight: { from: p(0), to: p(10) } });
      expect(world.probeGroup.children).toHaveLength(3);
      world.setProbe({ from: p(0), attackFrom: p(0) });
      expect(world.probeGroup.children).toHaveLength(2);
      world.setProbe(undefined);
      expect(world.probeGroup.children).toHaveLength(0);
    });

    it('shows the collision layer only when asked', () => {
      const world = new WorldScene();
      expect(world.camera.layers.isEnabled(COLLISION_LAYER)).toBe(false);
      world.setCollisionVisible(true);
      expect(world.camera.layers.isEnabled(COLLISION_LAYER)).toBe(true);
      world.setCollisionVisible(false);
      expect(world.camera.layers.isEnabled(COLLISION_LAYER)).toBe(false);
    });

    it('draws area triggers as spheres and turned boxes, picked only when asked', () => {
      const world = new WorldScene();
      world.setAreaTriggers([
        { key: 'areatrigger:1', label: 'A', position: at(0, 0), radius: 5 },
        {
          key: 'areatrigger:2',
          label: 'B',
          position: at(100, 0),
          radius: 0,
          box: { length: 10, width: 4, height: 6, orientation: Math.PI / 2 },
        },
        { key: 'areatrigger:3', label: 'C', position: at(200, 0), radius: 0 },
      ]);
      const [sphere, box, tiny] = world.triggerGroup.children as Mesh[];
      expect(sphere.geometry).toBeInstanceOf(SphereGeometry);
      expect((sphere.geometry as SphereGeometry).parameters.radius).toBe(5);
      expect((tiny.geometry as SphereGeometry).parameters.radius).toBe(0.5);
      expect((box.geometry as BoxGeometry).parameters).toEqual(expect.objectContaining({ width: 4, height: 6, depth: 10 }));
      expect(box.rotation.y).not.toBe(0);
      expect(sphere.position.x).toBeCloseTo(worldToScene(at(0, 0)).x);

      lookDownAt(world, at(0, 0));
      expect(world.pick(0, 0, { tolerance: 0, areaTriggers: true })).toEqual(
        expect.objectContaining({ type: 'areatrigger', key: 'areatrigger:1' }),
      );
      expect(world.pick(0, 0, { tolerance: 0, markersOnly: true })).toBeUndefined();
      // the edges aren't pickable on their own
      expect(sphere.children[0].raycast(undefined as never, [])).toBeUndefined();

      const dispose = vi.spyOn(sphere.geometry, 'dispose');
      world.setAreaTriggers([]);
      expect(dispose).toHaveBeenCalled();
      expect(world.triggerGroup.children).toHaveLength(0);
      world.dispose();
    });

    it('picks a spawn by its model', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0))]);
      world.setSpawnModel('creature:1', new Mesh(new BoxGeometry(30, 1, 30), new MeshLambertMaterial()));
      lookDownAt(world, at(12, 0));
      expect(world.pick(0, 0, { tolerance: 0 })).toEqual(expect.objectContaining({ type: 'spawn', key: 'creature:1' }));
    });

    it('circles wandering creatures with their wander distance, at real size', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0), { wanderRadius: 10 }), spawn('creature:2', 'creature', at(5000, 0))]);
      const ring = world.getObject('creature:1')?.getObjectByName('wander') as Line;
      expect(ring).toBeDefined();
      expect(world.getObject('creature:2')?.getObjectByName('wander')).toBeUndefined();
      world.camera.position.set(0, 0, 0);
      world.updateMarkerScale();
      const marker = world.getObject('creature:1') as Mesh;
      expect(ring.scale.x * marker.scale.x).toBeCloseTo(10);
      // not clickable, and shared between spawns (not disposed with them)
      lookDownAt(world, at(9, 0));
      expect(world.pick(0, 0, { tolerance: 0 })).toBeUndefined();
      const dispose = vi.spyOn(ring.geometry, 'dispose');
      world.setSpawns([]);
      expect(dispose).not.toHaveBeenCalled();
    });

    it('scales markers with camera distance', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0)), spawn('creature:2', 'creature', at(5000, 0))]);
      lookDownAt(world, at(0, 0), 10);
      world.updateMarkerScale();
      expect(world.getObject('creature:1')?.scale.x).toBe(1);
      expect(world.getObject('creature:2')?.scale.x).toBe(8);
    });
  });

  describe('waypoints', () => {
    const path = (closed: boolean, count = 3): WaypointPath => ({
      key: 'path:1',
      label: 'Path 1',
      closed,
      points: Array.from({ length: count }, (_, i) => ({ point: i + 1, position: at(i * 10, 0), orientation: i === 0 ? null : 0.5 })),
    });

    const lineOf = (world: WorldScene): Line => world.scene.getObjectByName('path:1:line') as Line;

    it('draws a line through the points and a sphere per point', () => {
      const world = new WorldScene();
      world.setWaypointPaths([path(false)]);
      expect(world.objectKeys).toEqual(['path:1#1', 'path:1#2', 'path:1#3']);
      expect(lineOf(world).geometry.getAttribute('position').count).toBe(3);

      const state = world.getObjectState('path:1#2');
      expect(state?.position.x).toBeCloseTo(at(10, 0).x);
      expect(state?.position.z).toBeCloseTo(50);
    });

    it('draws an arrow per segment pointing to the next point, and keeps them in sync', () => {
      const world = new WorldScene();
      const arrowsOf = (): Mesh[] => (world.scene.getObjectByName('path:1:arrows') as Group).children as Mesh[];
      const p = path(true);
      p.points.push({ point: 9, position: at(20, 0) });
      world.setWaypointPaths([p]);
      // 1→2, 2→3, 3→9 (same spot: skipped), 9→1
      expect(arrowsOf().length).toBe(3);
      const forward = new Vector3(0, 1, 0).applyQuaternion(arrowsOf()[0].quaternion);
      // points 1 → 2 go north (x increasing), i.e. towards scene −z
      expect(forward.z).toBeCloseTo(-1);

      world.getObject('path:1#2')?.position.set(1, 2, 3);
      world.refreshPathLine('path:1');
      expect(arrowsOf().length).toBe(3);

      world.camera.position.set(1e6, 0, 0);
      world.updateMarkerScale();
      expect(arrowsOf()[0].scale.x).toBe(8);
      world.setWaypointPaths([]);
      expect(world.scene.getObjectByName('path:1:arrows')).toBeUndefined();
    });

    it('closes looping paths with more than two points', () => {
      const world = new WorldScene();
      world.setWaypointPaths([path(true)]);
      expect(lineOf(world).geometry.getAttribute('position').count).toBe(4);
      world.setWaypointPaths([path(true, 2)]);
      expect(lineOf(world).geometry.getAttribute('position').count).toBe(2);
    });

    it('redraws the line after a point moved', () => {
      for (const closed of [false, true]) {
        const world = new WorldScene();
        world.setWaypointPaths([path(closed)]);
        world.getObject('path:1#2')?.position.set(1, 2, 3);
        world.refreshPathLine('path:1');
        const positions = lineOf(world).geometry.getAttribute('position');
        expect(positions.count).toBe(closed ? 4 : 3);
        expect([positions.getX(1), positions.getY(1), positions.getZ(1)]).toEqual([1, 2, 3]);
      }
      new WorldScene().refreshPathLine('unknown');
    });

    it('points each waypoint ball at the next point', () => {
      const pointerDirection = (world: WorldScene, point: number): Vector3 | undefined => {
        const pointer = world.getObject(`path:1#${point}`)?.getObjectByName('pointer');
        if (!pointer) {
          return undefined;
        }
        pointer.updateWorldMatrix(true, false);
        return new Vector3(0, 1, 0).applyQuaternion(pointer.getWorldQuaternion(new Quaternion())).round();
      };
      // points 10 yards apart going north (server +x = scene −z)
      const north = new Vector3(0, 0, -1);
      for (const closed of [false, true]) {
        const world = new WorldScene();
        world.setWaypointPaths([path(closed)]);
        expect(pointerDirection(world, 1)?.equals(north)).toBe(true);
        expect(pointerDirection(world, 2)?.equals(north)).toBe(true);
        // the last point of an open path keeps going; of a loop, heads back to the first
        expect(pointerDirection(world, 3)?.equals(closed ? new Vector3(0, 0, 1) : north)).toBe(true);
      }

      // after point 3 moved east, point 2 points east and point 3 keeps the direction it is reached from
      const world = new WorldScene();
      world.setWaypointPaths([path(false)]);
      const second = world.getObject('path:1#2') as Mesh;
      world.getObject('path:1#3')?.position.set(second.position.x + 10, second.position.y, second.position.z);
      world.refreshPathLine('path:1');
      expect(pointerDirection(world, 2)?.equals(new Vector3(1, 0, 0))).toBe(true);
      expect(pointerDirection(world, 3)?.equals(new Vector3(1, 0, 0))).toBe(true);

      // the pointer is highlighted with its ball
      world.setSelection('path:1#2');
      expect((second.getObjectByName('pointer') as Mesh).material).toBe(second.material);

      // single or stacked points have no direction
      const single = new WorldScene();
      single.setWaypointPaths([{ key: 'path:1', label: 'Path 1', points: [{ point: 1, position: at(0, 0) }] }]);
      expect(pointerDirection(single, 1)).toBeUndefined();
    });

    describe('places and checks', () => {
      /** Ground at 10 everywhere, a lake (surface at 20) 20..60 yards west of the centre. */
      const lakeWorld = () => {
        const world = new WorldScene();
        const corner = (dx: number, dy: number) => {
          const p = worldToScene({ x: CENTER.x + dx, y: CENTER.y + dy, z: 20 });
          return [p.x, p.y, p.z];
        };
        const lake = {
          type: 1,
          kind: 'water' as const,
          positions: Float32Array.from([...corner(-20, 20), ...corner(20, 20), ...corner(20, 60), ...corner(-20, 60)]),
          indices: Uint16Array.from([0, 1, 2, 0, 2, 3]),
        };
        world.setTerrainTileDetailed(
          { tx: 32, ty: 48 },
          flatDetail(10).chunks.map((mesh) => ({ mesh, layers: [] })),
          new Texture(),
          [lake],
        );
        world.scene.updateMatrixWorld();
        return world;
      };

      it('tells ground, air and water points apart', () => {
        const world = lakeWorld();
        expect(world.waypointPlace(at(0, 0, 10.5))).toBe('ground');
        expect(world.waypointPlace(at(0, 0, 20))).toBe('air');
        expect(world.waypointPlace(at(0, 40, 15))).toBe('water');
        expect(world.waypointPlace(at(0, 40, 20.3))).toBe('water');
        expect(world.waypointPlace(at(0, 40, 22))).toBe('ground');
        expect(world.waypointPlace(at(0, 40, 25))).toBe('air');
        // nothing loaded there: ground
        expect(world.waypointPlace(at(5000, 0, 500))).toBe('ground');
        // a cave under the lake: a roof between the point and the surface
        const roof = new Mesh(new BoxGeometry(10, 1, 10), new MeshBasicMaterial());
        const p = worldToScene(at(0, 40, 17));
        roof.position.set(p.x, p.y, p.z);
        world.buildingGroup.add(roof);
        world.scene.updateMatrixWorld();
        expect(world.waypointPlace(at(0, 40, 15))).toBe('air');
      });

      it('draws ground points as balls, air points as cubes with a line to the floor, water points as pyramids', () => {
        const world = lakeWorld();
        world.setWaypointPaths([
          {
            key: 'path:1',
            label: 'Path 1',
            points: [
              { point: 1, position: at(0, 0, 10.5) },
              { point: 2, position: at(5, 0, 25) },
              { point: 3, position: at(0, 40, 15) },
            ],
          },
        ]);
        const geometry = (key: string) => (world.getObject(key) as Mesh).geometry.type;
        expect([geometry('path:1#1'), geometry('path:1#2'), geometry('path:1#3')]).toEqual([
          'SphereGeometry',
          'BoxGeometry',
          'TetrahedronGeometry',
        ]);
        expect(world.waypointPlaceOf('path:1#2')).toBe('air');
        const drops = world.scene.getObjectByName('path:1:drops') as LineSegments;
        // the drop line and the 4 sides of the square on the floor
        expect(drops.geometry.getAttribute('position').count).toBe(10);
        expect(drops.raycast(undefined as never, [])).toBeUndefined();
        // moved down to the ground: a ball, no drop line
        const second = world.getObject('path:1#2') as Mesh;
        second.position.y = worldToScene(at(5, 0, 10.5)).y + 0.4;
        world.refreshPathLine('path:1');
        expect(geometry('path:1#2')).toBe('SphereGeometry');
        expect(world.scene.getObjectByName('path:1:drops')).toBeUndefined();
      });

      it('marks checked points with a coloured "!", kept when the paths are drawn again', () => {
        const world = lakeWorld();
        const paths: WaypointPath[] = [{ key: 'path:1', label: 'Path 1', points: [{ point: 1, position: at(0, 0, 10.5) }] }];
        world.setWaypointPaths(paths);
        const check = { key: 'path:1#1', point: 1, place: 'ground' as const, status: 'warn' as const, reason: 'x' };
        world.setWaypointChecks([check, { ...check, key: 'path:1#9' }]);
        const mark = () => world.getObject('path:1#1')?.getObjectByName('check');
        const bar = mark()?.children[0] as Mesh;
        expect((bar.material as MeshBasicMaterial).color.getHex()).toBe(0xf1c40f);
        expect(bar.raycast(undefined as never, [])).toBeUndefined();
        world.setWaypointPaths(paths);
        expect(mark()).toBeDefined();
        world.setWaypointChecks([]);
        expect(mark()).toBeUndefined();
      });
    });

    it('highlights a selected waypoint', () => {
      const world = new WorldScene();
      world.setWaypointPaths([path(false)]);
      world.setSelection('path:1#1');
      expect(((world.getObject('path:1#1') as Mesh).material as MeshLambertMaterial).emissiveIntensity).toBeGreaterThan(0);
    });
  });

  describe('picking', () => {
    const setup = (): WorldScene => {
      const world = new WorldScene();
      world.setTerrainTile(flatTile(50));
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0))]);
      world.setWaypointPaths([{ key: 'path:9', label: 'Path 9', points: [{ point: 4, position: at(100, 100) }] }]);
      return world;
    };

    it('picks spawns', () => {
      const world = setup();
      lookDownAt(world, at(0, 0));
      expect(world.pick(0, 0)).toEqual({ type: 'spawn', key: 'creature:1', position: expect.objectContaining({ z: 50 }) });
    });

    it('picks the direction arrows of paths only when asked', () => {
      const world = new WorldScene();
      world.setWaypointPaths([
        {
          key: 'path:2',
          label: 'Path 2',
          closed: true,
          points: [
            { point: 1, position: at(0, -100) },
            { point: 2, position: at(0, 100) },
            { point: 3, position: at(200, 0) },
          ],
        },
      ]);
      lookDownAt(world, at(0, 0), 30);
      expect(world.pick(0, 0, { tolerance: 0, segments: true })).toEqual(
        expect.objectContaining({ type: 'segment', pathKey: 'path:2', from: 1, to: 2 }),
      );
      expect(world.pick(0, 0, { tolerance: 0 })?.type).not.toBe('segment');
      // after a move, the arrows keep their point numbers (the loop closes back to #1)
      world.refreshPathLine('path:2');
      lookDownAt(world, at(100, -50), 30);
      expect(world.pick(0, 0, { tolerance: 0, segments: true })).toEqual(expect.objectContaining({ type: 'segment', from: 3, to: 1 }));
    });

    it('picks waypoints', () => {
      const world = setup();
      lookDownAt(world, at(100, 100));
      expect(world.pick(0, 0)).toEqual(expect.objectContaining({ type: 'waypoint', key: 'path:9#4', pathKey: 'path:9', point: 4 }));
    });

    it('picks the ground', () => {
      const world = setup();
      lookDownAt(world, at(-100, -100));
      const result = world.pick(0, 0);
      expect(result?.type).toBe('ground');
      expect(result?.position.x).toBeCloseTo(at(-100, -100).x, 1);
      expect(result?.position.z).toBeCloseTo(50, 1);
    });

    it('picks the marker nearest to the cursor when the ray just misses', () => {
      const world = setup();
      lookDownAt(world, at(0, 1.2));
      expect(world.pick(0, 0, { tolerance: 0 })?.type).toBe('ground');
      expect(world.pick(0, 0)).toEqual(expect.objectContaining({ type: 'spawn', key: 'creature:1' }));
    });

    it('picks only the ground when asked to', () => {
      const world = setup();
      lookDownAt(world, at(0, 0));
      expect(world.pick(0, 0, { groundOnly: true })?.type).toBe('ground');
    });

    it('skips the terrain when only markers are wanted', () => {
      const world = setup();
      lookDownAt(world, at(-100, -100));
      expect(world.pick(0, 0, { markersOnly: true })).toBeUndefined();
    });

    it('ignores markers behind the camera', () => {
      const world = setup();
      const p = worldToScene(at(0, 0));
      world.camera.position.set(p.x, p.y + 5, p.z - 20);
      world.camera.lookAt(p.x, p.y + 5, p.z - 40);
      expect(world.pick(0, 0, { tolerance: 2 })?.type).not.toBe('spawn');
    });

    it('picks nothing in the sky', () => {
      const world = setup();
      world.camera.position.set(0, 1000, 0);
      world.camera.lookAt(0, 2000, 0);
      expect(world.pick(0, 0)).toBeUndefined();
    });
  });

  describe('lighting', () => {
    const sample = {
      diffuse: [1, 0.5, 0] as [number, number, number],
      ambient: [0.2, 0.3, 0.4] as [number, number, number],
      skyTop: [0, 0, 1] as [number, number, number],
      skyMiddle: [0, 0.5, 1] as [number, number, number],
      skyHorizon: [1, 1, 1] as [number, number, number],
      fog: [0.5, 0.5, 0.5] as [number, number, number],
      water: [0, 1, 0] as [number, number, number],
      ocean: [0, 0, 1] as [number, number, number],
      fogStart: 100,
      fogEnd: 600,
    };
    const sky = (world: WorldScene) => world.scene.getObjectByName('sky') as Mesh<BufferGeometry, ShaderMaterial>;

    it('lights the world like the zone, with its fog and sky', () => {
      const world = new WorldScene();
      world.applyLighting(sample);
      const fog = world.scene.fog as Fog;
      expect(fog.near).toBe(100);
      expect(fog.far).toBe(600);
      expect(fog.color.getHexString(SRGBColorSpace)).toBe('808080');
      expect((world.scene.background as Color).getHexString(SRGBColorSpace)).toBe('808080');
      expect(world.terrainLighting.sunColor.value.toArray()).toEqual([1, 0.5, 0]);
      expect(sky(world).visible).toBe(true);
      expect((sky(world).material.uniforms['top'].value as Color).getHexString(SRGBColorSpace)).toBe('0000ff');

      // the sky follows the camera, inside its far plane
      world.camera.position.set(10, 20, 30);
      world.updateMarkerScale();
      expect(sky(world).position.toArray()).toEqual([10, 20, 30]);
      expect(sky(world).scale.x).toBeLessThan(world.camera.far);
    });

    it('keeps a minimum view distance in thick fog', () => {
      const world = new WorldScene();
      world.applyLighting({ ...sample, fogStart: 500, fogEnd: 100 });
      const fog = world.scene.fog as Fog;
      expect(fog.far).toBe(400);
      expect(fog.near).toBe(360);
      world.applyLighting({ ...sample, fogStart: -5 });
      expect(fog.near).toBe(0);
    });

    it('colours water and sea like the zone, before and after they are drawn', () => {
      const liquid = (kind: 'water' | 'ocean' | 'magma') => ({
        type: 1,
        kind,
        positions: new Float32Array([0, 50, 0, 1, 50, 0, 0, 50, 1]),
        indices: new Uint16Array([0, 2, 1]),
      });
      const colorOf = (world: WorldScene, i: number) =>
        (
          (world.scene.getObjectByName('tile:32_48') as Group).children.filter((c) => c.name === 'liquid')[i] as Mesh<
            BufferGeometry,
            MeshLambertMaterial
          >
        ).material.color.getHexString(SRGBColorSpace);
      const world = new WorldScene();
      world.setTerrainTileDetailed({ tx: 32, ty: 48 }, [], new Texture(), [liquid('water')]);
      world.applyLighting(sample);
      world.setTerrainTileDetailed({ tx: 32, ty: 48 }, [], new Texture(), [liquid('water'), liquid('ocean'), liquid('magma')]);
      expect([colorOf(world, 0), colorOf(world, 1), colorOf(world, 2)]).toEqual(['00ff00', '0000ff', 'ff5a1f']);
      world.applyLighting(undefined);
      expect(colorOf(world, 0)).toBe('2a6b9c');
    });

    it('goes back to the neutral light', () => {
      const world = new WorldScene();
      const fog = world.scene.fog as Fog;
      const neutral = { near: fog.near, far: fog.far, sun: world.terrainLighting.sunColor.value.clone() };
      world.applyLighting(sample);
      world.applyLighting(undefined);
      expect(fog.near).toBe(neutral.near);
      expect(fog.far).toBe(neutral.far);
      expect(world.terrainLighting.sunColor.value.equals(neutral.sun)).toBe(true);
      expect(sky(world).visible).toBe(false);
    });
  });

  it('marks a place with a beacon', () => {
    const world = new WorldScene();
    const beacon = world.scene.getObjectByName('beacon') as Group;
    expect(beacon.visible).toBe(false);
    world.setBeacon(at(1, 2, 30));
    expect(beacon.visible).toBe(true);
    expect(beacon.position.y).toBe(30);
    world.setBeacon(undefined);
    expect(beacon.visible).toBe(false);
  });

  it('disposes everything', () => {
    const world = new WorldScene();
    world.setTerrainTile(flatTile());
    world.setSpawns([spawn('creature:1', 'creature', at(0, 0))]);
    world.setWaypointPaths([{ key: 'p', label: 'p', points: [] }]);
    const disposeSpy = vi.spyOn(BufferGeometry.prototype, 'dispose');
    world.dispose();
    expect(world.terrainKeys).toEqual([]);
    expect(world.objectKeys).toEqual([]);
    expect(disposeSpy).toHaveBeenCalled();
  });
});
