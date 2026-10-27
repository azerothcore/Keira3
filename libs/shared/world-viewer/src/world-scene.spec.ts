import { tileCenter, worldToScene, WorldPosition } from '@keira/shared/wow-data';
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  ConeGeometry,
  Color,
  Fog,
  Group,
  Line,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  Vector3,
} from 'three';
import { flatDetail, flatTile } from './world-viewer.mock';
import { COLLISION_LAYER, SERVER_COLLISION_LAYER } from './collision-object';
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
    it('highlights the spawns selected along with the main one', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0)), spawn('creature:2', 'creature', at(5, 0))]);
      const emissive = (key: string) => ((world.getObject(key) as Mesh).material as MeshLambertMaterial).emissiveIntensity;
      world.setSelection('creature:1');
      expect(emissive('creature:2')).toBe(0);
      world.setGroupSelection(['creature:2']);
      expect(emissive('creature:2')).toBeGreaterThan(0);
      world.setGroupSelection([]);
      expect(emissive('creature:2')).toBe(0);
    });

    it('keeps the pins (and models) of spawns that did not change, and redraws the others', () => {
      const world = new WorldScene();
      const first = [spawn('creature:1', 'creature', at(0, 0)), spawn('creature:2', 'creature', at(5, 0))];
      expect([...world.setSpawns(first)]).toEqual([]);
      const pin = world.getObject('creature:1');
      const model = new Object3D();
      world.setSpawnModel('creature:1', model);
      expect([...world.setSpawns([first[0], spawn('creature:2', 'creature', at(6, 0))])]).toEqual(['creature:1']);
      expect(world.getObject('creature:1')).toBe(pin);
      expect(model.parent).toBe(pin);
      // dragged and not saved: put back
      pin?.position.set(100, 0, 0);
      expect([...world.setSpawns(first)]).toEqual([]);
      expect(world.getObject('creature:1')).not.toBe(pin);
      expect(world.getObject('creature:1')?.position.x).toBeCloseTo(worldToScene(at(0, 0)).x);
      // gone
      world.setSpawns([]);
      expect(world.objectKeys).toEqual([]);
    });

    it('moves a copy of a spawn on its own (the movement simulation), without its wander circle', () => {
      const world = new WorldScene();
      world.setSpawns([spawn('creature:1', 'creature', at(0, 0), { wanderRadius: 5 })]);
      world.moveGhost(at(1, 1), 0);
      expect(world.setGhost('creature:9')).toBe(false);
      expect(world.setGhost('creature:1')).toBe(true);
      const ghost = world.scene.getObjectByName('ghost') as Object3D;
      expect(ghost.getObjectByName('wander')).toBeUndefined();
      expect(ghost.raycast(undefined as never, [])).toBeUndefined();
      world.moveGhost(at(10, 0), Math.PI / 2);
      expect(ghost.position.equals(new Vector3(worldToScene(at(10, 0)).x, worldToScene(at(10, 0)).y, worldToScene(at(10, 0)).z))).toBe(
        true,
      );
      world.setGhost(undefined);
      expect(world.scene.getObjectByName('ghost')).toBeUndefined();
    });

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

    it("checks the line of sight against the server's collision instead of the client's once it's there", () => {
      const world = new WorldScene();
      world.setTerrainTile(flatTile(10));
      const at2 = (dx: number, z: number) => ({ x: CENTER.x + dx, y: CENTER.y, z });
      const wall = (layer: number) => {
        const mesh = new Mesh(new BoxGeometry(10, 20, 1), new MeshBasicMaterial());
        const p = worldToScene(at2(10, 0));
        mesh.position.set(p.x, 10, p.z);
        mesh.layers.set(layer);
        return mesh;
      };
      world.buildingGroup.add(wall(COLLISION_LAYER));
      expect(world.lineOfSightBlock(at2(0, 12), at2(20, 12))).toBeDefined();
      world.setServerCollision(true);
      expect(world.lineOfSightBlock(at2(0, 12), at2(20, 12))).toBeUndefined();
      world.serverCollisionGroup.add(wall(SERVER_COLLISION_LAYER));
      expect(world.lineOfSightBlock(at2(0, 12), at2(20, 12))?.x).toBeCloseTo(CENTER.x + 9.5);
      // drawn with the hitboxes
      world.setCollisionVisible(true);
      expect(world.camera.layers.isEnabled(SERVER_COLLISION_LAYER)).toBe(true);
      world.setCollisionVisible(false);
      expect(world.camera.layers.isEnabled(SERVER_COLLISION_LAYER)).toBe(false);
    });

    it('draws links (dashed or with an arrow head) and markers picked only when asked, scaled like the other markers', () => {
      const world = new WorldScene();
      const overlays = () => world.scene.getObjectByName('overlays') as Group;
      world.setOverlays(
        [
          { key: 'link:1', from: at(0, 0), to: at(10, 0), color: 0xff0000, arrow: true },
          { key: 'link:2', from: at(0, 0), to: at(0, 10), color: 0x00ff00, dashed: true },
          { key: 'link:3', from: at(5, 5), to: at(5, 5), color: 0x00ff00, arrow: true },
        ],
        [{ key: 'marker:1', position: at(20, 20), color: 0x0000ff, label: 'Graveyard' }],
      );
      // 3 lines, 1 arrow head (none for a link of no length), 1 marker
      expect(overlays().children).toHaveLength(5);
      const line = overlays().getObjectByName('link:2') as Line;
      expect(line.material).toBeInstanceOf(LineDashedMaterial);
      expect(line.raycast(undefined as never, [])).toBeUndefined();
      const head = overlays().children.find((child) => child instanceof Mesh && !child.name) as Mesh;
      expect(head.raycast(undefined as never, [])).toBeUndefined();

      const marker = world.scene.getObjectByName('marker:1') as Mesh;
      const p = worldToScene(at(20, 20));
      lookDownAt(world, { ...at(20, 20), z: 52.4 }, 30);
      expect(world.pick(0, 0, { markersOnly: true })).toBeUndefined();
      expect(world.pick(0, 0, { markersOnly: true, overlays: true })).toEqual(
        expect.objectContaining({ type: 'overlay', key: 'marker:1' }),
      );
      world.camera.position.set(p.x, p.y + 600, p.z);
      world.updateMarkerScale();
      expect(marker.scale.x).toBeGreaterThan(1);

      world.setOverlays([], []);
      expect(overlays().children).toHaveLength(0);
    });

    it('gives labelled links a pickable arrow on each stretch, telling the way (triangular pyramids for flight paths)', () => {
      const world = new WorldScene();
      world.setOverlays(
        [
          { key: 'flight:1', from: at(0, 0), via: [at(20, 0), at(20, 0)], to: at(20, 20), color: 0xf0c419, arrow: true, label: 'Flight' },
          { key: 'teleport:1', from: at(0, 40), to: at(10, 40), color: 0x74b9ff, label: 'Teleport' },
        ],
        [],
      );
      const arrows = (key: string) =>
        (world.scene.getObjectByName('overlays') as Group).children.filter((c) => c.name === `${key}:arrow`) as Mesh[];
      // the stretch of no length gets none
      expect(arrows('flight:1')).toHaveLength(2);
      expect((arrows('flight:1')[0].geometry as ConeGeometry).parameters.radialSegments).toBe(3);
      expect((arrows('teleport:1')[0].geometry as ConeGeometry).parameters.radialSegments).toBe(8);
      // the second stretch goes west (+y)
      const middle = { x: CENTER.x + 20, y: CENTER.y + 10, z: 50 };
      lookDownAt(world, { ...middle, z: middle.z + 0.4 }, 30);
      const hit = world.pick(0, 0, { markersOnly: true, overlays: true });
      expect(hit).toEqual(expect.objectContaining({ type: 'overlay', key: 'flight:1' }));
      expect((hit as { direction: number }).direction).toBeCloseTo(Math.PI / 2);
    });

    it('draws the Path / LOS probe and clears it', () => {
      const world = new WorldScene();
      const p = (dx: number) => at(dx, 0);
      world.setProbe({ from: p(0) });
      expect(world.probeGroup.children).toHaveLength(1);
      world.setProbe({
        from: p(0),
        to: p(10),
        path: [p(0), p(5), p(5.5), p(10)],
        sight: { from: p(0), to: p(10), blockedAt: p(4) },
        attackFrom: p(6),
      });
      // path, 2 arrows along it (none on the short stretch), the dashed red sight line, block dot, A, C, attack dot and line
      expect(world.probeGroup.children).toHaveLength(9);
      expect(world.probeGroup.children.filter((child) => child.name === 'probe-path-arrow')).toHaveLength(2);
      const sight = world.probeGroup.children.find(
        (child) => child instanceof Line && child.material instanceof LineDashedMaterial,
      ) as Line;
      expect((sight.material as LineDashedMaterial).color.getHex()).toBe(0xef4444);
      expect((world.probeGroup.getObjectByName('probe-path-arrow') as Mesh).raycast(undefined as never, [])).toBeUndefined();
      world.setProbe({ from: p(0), to: p(10), sight: { from: p(0), to: p(10) } });
      expect(world.probeGroup.children).toHaveLength(3);
      world.setProbe({ from: p(0), attackFrom: p(0) });
      expect(world.probeGroup.children).toHaveLength(2);
      world.setProbe(undefined);
      expect(world.probeGroup.children).toHaveLength(0);
    });

    it('draws boss boundaries: outlines and fills at their height or at both heights of their height ranges, picked for hover', () => {
      const world = new WorldScene();
      const group = () => world.scene.getObjectByName('boundaries') as Group;
      const c = at(0, 0);
      world.setBoundaries([
        {
          key: 'boundary:1',
          label: 'Patchwerk',
          color: 0xff00ff,
          z: 50,
          shapes: [
            { type: 'circle', center: { x: c.x, y: c.y }, radius: 20, inverted: false },
            { type: 'rectangle', minX: c.x + 5, maxX: c.x + 8, minY: c.y + 5, maxY: c.y + 8, inverted: true },
          ],
        },
        {
          key: 'boundary:2',
          label: 'Pit',
          color: 0x00ffff,
          z: 0,
          shapes: [
            {
              type: 'intersect',
              shapes: [
                { type: 'rectangle', minX: c.x + 100, maxX: c.x + 110, minY: c.y, maxY: c.y + 10, inverted: false },
                { type: 'zrange', minZ: 40, maxZ: 60, inverted: false },
              ],
              inverted: false,
            },
          ],
        },
        // only a height range: nothing to draw
        { key: 'boundary:3', label: 'Height', color: 0, z: 0, shapes: [{ type: 'zrange', minZ: 1, maxZ: 2, inverted: false }] },
      ]);
      // 2 shapes at one height + 1 shape at two heights, each an outline and a fill
      expect(group().children).toHaveLength(8);
      const dashed = group().children.find((child) => child instanceof Line && child.material instanceof LineDashedMaterial) as Line;
      expect((dashed.material as LineDashedMaterial).color.getHex()).toBe(0xff4757);
      expect(dashed.raycast(undefined as never, [])).toBeUndefined();
      const fills = group().children.filter((child) => child.name === 'boundary:2:fill');
      expect(fills.map((fill) => Math.round(((fill as Mesh).geometry.getAttribute('position') as BufferAttribute).getY(1)))).toEqual(
        [40, 60].map((z) => Math.round(z + 0.3)),
      );
      lookDownAt(world, { ...c, z: 50.3 }, 30);
      expect(world.pick(0, 0, { markersOnly: true, overlays: true })).toEqual(
        expect.objectContaining({ type: 'overlay', key: 'boundary:1' }),
      );
      expect(world.pick(0, 0, { markersOnly: true })).toBeUndefined();
      world.setBoundaries([]);
      expect(group().children).toHaveLength(0);
    });

    it('names the line under the cursor: a stretch of a waypoint path, or of a labelled link with its way', () => {
      const world = new WorldScene();
      world.setWaypointPaths([
        {
          key: 'path:1',
          label: 'Path 1',
          points: [
            { point: 1, position: at(0, 0) },
            { point: 2, position: at(0, 40) },
          ],
        },
        // behind the camera: never picked
        {
          key: 'path:2',
          label: 'Path 2',
          points: [
            { point: 1, position: at(0, 0, 900) },
            { point: 2, position: at(5, 40, 900) },
          ],
        },
      ]);
      world.setOverlays(
        [
          { key: 'flight:1', label: 'Flight', from: at(100, 0), via: [at(100, 40)], to: at(140, 40), color: 0xf0c419 },
          // a stretch of no length
          { key: 'flight:2', label: 'Still', from: at(300, 300), to: at(300, 300), color: 0xf0c419 },
        ],
        [],
      );
      // a quarter along the path: away from its points and from its arrow
      lookDownAt(world, { ...at(0, 10), z: 50.4 }, 30);
      expect(world.pick(0, 0, { markersOnly: true, segments: true })).toEqual(
        expect.objectContaining({ type: 'segment', pathKey: 'path:1', from: 1, to: 2 }),
      );
      // without asking for segments, nothing
      expect(world.pick(0, 0, { markersOnly: true })).toBeUndefined();
      lookDownAt(world, { ...at(100, 10), z: 50.4 }, 30);
      const flight = world.pick(0, 0, { markersOnly: true, overlays: true });
      expect(flight).toEqual(expect.objectContaining({ type: 'overlay', key: 'flight:1' }));
      expect((flight as { direction: number }).direction).toBeCloseTo(Math.PI / 2);
      // the paths drawn again: the old lines are forgotten
      world.setWaypointPaths([]);
      lookDownAt(world, { ...at(0, 10), z: 50.4 }, 30);
      expect(world.pick(0, 0, { markersOnly: true, segments: true })).toBeUndefined();
    });

    it('draws A and C as pins, A with a cone towards C, picked and moved while dragged', () => {
      const world = new WorldScene();
      world.setProbe({ from: at(0, 0), to: at(10, 0) });
      const from = world.scene.getObjectByName('probe-from') as Group;
      // ball, pin, cone over it, cone towards C
      expect(from.children).toHaveLength(4);
      expect((world.scene.getObjectByName('probe-to') as Group).children).toHaveLength(3);
      lookDownAt(world, { ...at(0, 0), z: 50.3 }, 30);
      expect(world.pickProbeHandle(0, 0)).toBe('from');
      expect(world.pickProbeHandle(0.9, 0.9)).toBeUndefined();
      world.moveProbeHandle('to', at(20, 0));
      expect(world.probeHandlePositions()).toEqual([
        { which: 'from', position: expect.objectContaining({ x: CENTER.x }) },
        { which: 'to', position: expect.objectContaining({ x: CENTER.x + 20 }) },
      ]);
      expect(world.probeHandlePositions()[1].position.z).toBeCloseTo(50);
      // C on A: no cone towards it
      world.setProbe({ from: at(0, 0), to: at(0, 0) });
      expect((world.scene.getObjectByName('probe-from') as Group).children).toHaveLength(3);
      world.setProbe(undefined);
      expect(world.probeHandlePositions()).toEqual([]);
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

    it('keeps the paths that did not change, and draws again those dragged without saving', () => {
      const world = new WorldScene();
      const other: WaypointPath = { key: 'path:2', label: 'Path 2', points: [{ point: 1, position: at(50, 50) }] };
      world.setWaypointPaths([path(false), other]);
      const line = lineOf(world);
      world.setWaypointPaths([path(false), { ...other, label: 'Renamed' }]);
      expect(lineOf(world)).toBe(line);
      world.getObject('path:1#2')?.position.set(1, 2, 3);
      world.setWaypointPaths([path(false), { ...other, label: 'Renamed' }]);
      expect(lineOf(world)).not.toBe(line);
      expect(world.getObjectState('path:1#2')?.position.x).toBeCloseTo(at(10, 0).x);
      expect(world.objectKeys).toContain('path:2#1');
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
        // under the terrain, nothing below
        expect(world.waypointPlace(at(0, 0, 5))).toBe('under');
        // a cave under the lake: a roof between the point and the surface
        const roof = new Mesh(new BoxGeometry(10, 1, 10), new MeshBasicMaterial());
        const p = worldToScene(at(0, 40, 17));
        roof.position.set(p.x, p.y, p.z);
        world.buildingGroup.add(roof);
        world.scene.updateMatrixWorld();
        expect(world.waypointPlace(at(0, 40, 15))).toBe('air');
      });

      it('draws ground points as cones, air points as square pyramids with a line to the floor, water points as pentagonal pyramids', () => {
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
        // the number of sides of each cone / pyramid
        const geometry = (key: string) => ((world.getObject(key) as Mesh).geometry as ConeGeometry).parameters.radialSegments;
        expect([geometry('path:1#1'), geometry('path:1#2'), geometry('path:1#3')]).toEqual([16, 4, 5]);
        expect(world.waypointPlaceOf('path:1#2')).toBe('air');
        const drops = world.scene.getObjectByName('path:1:drops') as LineSegments;
        // the drop line and the 4 sides of the square on the floor
        expect(drops.geometry.getAttribute('position').count).toBe(10);
        expect(drops.raycast(undefined as never, [])).toBeUndefined();
        // moved down to the ground: a cone, no drop line
        const second = world.getObject('path:1#2') as Mesh;
        second.position.y = worldToScene(at(5, 0, 10.5)).y + 0.4;
        world.refreshPathLine('path:1');
        expect(geometry('path:1#2')).toBe(16);
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
    // a player character on it, replaced or removed
    const model = new Group();
    world.setBeaconModel(model);
    world.setBeaconModel(new Group());
    expect(beacon.children.filter((child) => child.name === 'beacon-model')).toHaveLength(1);
    world.setBeaconModel(undefined);
    expect(beacon.getObjectByName('beacon-model')).toBeUndefined();
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
