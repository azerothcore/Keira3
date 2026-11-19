import { WmoModel, worldToScene } from '@keira/shared/wow-data';
import { DoubleSide, Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, Texture, Vector3 } from 'three';
import {
  applyPlacement,
  buildWmoObject,
  disposeWmoObject,
  setWmoIndoorVisible,
  isRoofTexture,
  ROOF_LAYER,
  serverQuaternionToScene,
} from './wmo-object';
import { COLLISION_LAYER } from './collision-object';

const group = (indoor: boolean, colors = indoor) => ({
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 1]),
  normals: new Float32Array(9),
  uvs: new Float32Array(6),
  colors: colors ? new Float32Array(9) : undefined,
  indices: new Uint16Array([0, 1, 2, 0, 2, 1]),
  batches: [
    { start: 0, count: 3, material: 0 },
    { start: 3, count: 3, material: 1 },
  ],
  indoor,
});

describe('wmo-object', () => {
  it('converts server rotations to scene rotations', () => {
    // a quarter turn around server z (up) turns north (+x) into west (+y)
    const q = serverQuaternionToScene([0, 0, Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)]);
    const north = worldToScene({ x: 1, y: 0, z: 0 });
    const west = worldToScene({ x: 0, y: 1, z: 0 });
    const turned = new Vector3(north.x, north.y, north.z).applyQuaternion(q);
    expect(turned.x).toBeCloseTo(west.x);
    expect(turned.y).toBeCloseTo(west.y);
    expect(turned.z).toBeCloseTo(west.z);
  });

  it('places objects', () => {
    const object = new Group();
    applyPlacement(object, { uniqueId: 1, path: 'a', position: [1, 2, 3], rotation: [0, 0, 0, 1], scale: 2 });
    expect(object.position.toArray()).toEqual([-2, 3, -1]);
    expect(object.scale.x).toBe(2);
  });

  it('builds a template with lit outdoor, vertex-lit indoor and unlit materials, shared between batches', () => {
    const textures = [new Texture()];
    const fallback = new Texture();
    const model: WmoModel = {
      materials: [
        { texture: 'a.blp', twoSided: true, unlit: false, blend: 0 },
        { texture: undefined, twoSided: false, unlit: true, blend: 1 },
      ],
      groups: [group(false), group(true), group(true, false), { ...group(false), indices: new Uint16Array(0) }],
    };
    const template = buildWmoObject(model, textures, fallback);
    expect(template.children.length).toBe(3);

    const [outdoor, indoor, indoorWithoutColors] = template.children as Mesh[];
    const outdoorMaterials = outdoor.material as (MeshLambertMaterial | MeshBasicMaterial)[];
    expect(outdoorMaterials[0]).toBeInstanceOf(MeshLambertMaterial);
    expect(outdoorMaterials[0].side).toBe(DoubleSide);
    expect(outdoorMaterials[0].map).toBe(textures[0]);
    expect(outdoorMaterials[1]).toBeInstanceOf(MeshBasicMaterial);
    expect(outdoorMaterials[1].map).toBe(fallback);
    // only alpha-keyed materials are cut out by their texture's alpha (an opaque roof's alpha means something else)
    expect(outdoorMaterials[0].alphaTest).toBe(0);
    expect(outdoorMaterials[1].alphaTest).toBe(0.5);
    expect(outdoor.geometry.groups.length).toBe(2);

    const indoorMaterial = (indoor.material as MeshBasicMaterial[])[0];
    expect(indoorMaterial.vertexColors).toBe(true);
    expect((indoorWithoutColors.material as MeshLambertMaterial[])[0]).toBe(outdoorMaterials[0]);

    const clone = template.clone();
    expect((clone.children[0] as Mesh).geometry).toBe(outdoor.geometry);
    // the indoor parts can be hidden (still picked), the rest stays
    setWmoIndoorVisible(template, false);
    expect(indoorMaterial.visible).toBe(false);
    expect(outdoorMaterials[0].visible).toBe(true);
    setWmoIndoorVisible(template, true);
    expect(indoorMaterial.visible).toBe(true);

    const dispose = vi.spyOn(outdoor.geometry, 'dispose');
    const disposeMaterial = vi.spyOn(indoorMaterial, 'dispose');
    disposeWmoObject(template);
    expect(dispose).toHaveBeenCalled();
    expect(disposeMaterial).toHaveBeenCalled();
  });

  it('puts the roofs of outdoor groups on their own layer', () => {
    const model: WmoModel = {
      materials: [
        { texture: 'Dungeons\\Textures\\Walls\\Wall.blp', twoSided: false, unlit: false, blend: 0 },
        { texture: 'Dungeons\\Textures\\Roof\\MM_ROOF_01.blp', twoSided: false, unlit: false, blend: 0 },
      ],
      groups: [
        {
          ...group(false),
          batches: [
            { start: 0, count: 3, material: 0 },
            { start: 0, count: 3, material: 1 },
          ],
        },
        { ...group(false), batches: [{ start: 0, count: 3, material: 1 }] },
        { ...group(true), batches: [{ start: 0, count: 3, material: 1 }] },
      ],
    };
    const template = buildWmoObject(model, [], new Texture());
    const roofs = template.children.filter((child) => child.name === 'roof') as Mesh[];
    expect(roofs).toHaveLength(2);
    expect(roofs.every((roof) => roof.layers.isEnabled(ROOF_LAYER) && !roof.layers.isEnabled(0))).toBe(true);
    // a roof shares its group's vertices
    expect(roofs[0].geometry.getAttribute('position')).toBe((template.children[0] as Mesh).geometry.getAttribute('position'));
    // indoor ceilings stay with the rest
    expect(template.children).toHaveLength(4);
    expect(isRoofTexture(undefined)).toBe(false);
  });

  it('adds the collision of every group on the collision layer, also of groups that draw nothing', () => {
    const collision = { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint16Array([0, 1, 2]) };
    const model: WmoModel = {
      materials: [{ texture: 'a.blp', twoSided: false, unlit: false, blend: 0 }],
      groups: [
        { ...group(false), collision },
        { ...group(false), indices: new Uint16Array(0), batches: [], collision },
        { ...group(false), collision: { positions: new Float32Array(0), indices: new Uint16Array(0) } },
      ],
    };
    const template = buildWmoObject(model, [], new Texture());
    const collisions = template.children.filter((child) => child.name === 'collision');
    expect(collisions).toHaveLength(2);
    expect(collisions.every((mesh) => mesh.layers.isEnabled(COLLISION_LAYER))).toBe(true);
    disposeWmoObject(template);
  });

  it('draws the invisible walls of its groups see-through (one material for all), named by group when hovered', () => {
    const walls = {
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      indices: new Uint16Array([0, 1, 2]),
      invisible: new Uint16Array([0, 1, 2]),
    };
    const model: WmoModel = {
      materials: [{ texture: 'a.blp', twoSided: false, unlit: false, blend: 0 }],
      groups: [
        { ...group(false), collision: walls },
        { ...group(false), collision: walls },
      ],
    };
    const template = buildWmoObject(model, [], new Texture());
    const invisible = template.children.filter((child) => child.name === 'invisible-walls') as Mesh[];
    expect(invisible.map((mesh) => mesh.userData['group'])).toEqual([0, 1]);
    expect(invisible[0].material).toBe(invisible[1].material);
    expect((invisible[0].material as Material).userData['invisible']).toBe(true);
    // the drawn groups are named too
    expect(template.children.filter((child) => child.name === '').map((child) => child.userData['group'])).toEqual([0, 1]);
    disposeWmoObject(template);
  });

  it('blends glass-like materials', () => {
    const model: WmoModel = { materials: [{ twoSided: false, unlit: false, blend: 2 }], groups: [group(false)] };
    const glass = ((buildWmoObject(model, [], new Texture()).children[0] as Mesh).material as MeshLambertMaterial[])[0];
    expect(glass.transparent).toBe(true);
    expect(glass.depthWrite).toBe(false);
  });

  it('copes with materials missing from the root', () => {
    const template = buildWmoObject({ materials: [], groups: [group(false)] }, [], new Texture());
    expect(((template.children[0] as Mesh).material as MeshLambertMaterial[])[0]).toBeInstanceOf(MeshLambertMaterial);
  });
});
