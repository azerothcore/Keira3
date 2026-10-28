import { M2Mesh } from '@keira/shared/wow-data';
import { DoubleSide, Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial } from 'three';
import { buildM2Template, disposeM2Template, M2Template } from './m2-object';
import { TextureCache } from './texture-cache';

/** What the skybox needs from `WowClientService`. */
export interface SkyboxSource {
  getM2(path: string): Promise<M2Mesh | undefined>;
}

/** How far out (share of the camera's far plane) the skybox is drawn. */
export const SKYBOX_DISTANCE = 0.5;
/** Turning speed (radians per second) of View > Turn the skybox slowly. */
export const SKYBOX_SPIN = 0.01;

/**
 * The zone's (or a chosen) skybox model (LightSkybox.dbc): drawn around the camera before everything else and behind
 * it, as the client does with its stars, clouds and auroras.
 */
export class WorldSkybox {
  readonly group = new Group();
  private path?: string;
  private template?: M2Template;
  private generation = 0;

  constructor(
    private readonly source: SkyboxSource,
    private readonly textures: TextureCache,
    private readonly onChange: () => void,
  ) {
    this.group.name = 'skybox';
  }

  /** The skybox model shown (undefined: none); loading it again only when it changes. */
  show(path: string | undefined): void {
    if (path?.toLowerCase() === this.path?.toLowerCase()) {
      return;
    }
    this.path = path;
    const generation = ++this.generation;
    this.clear();
    if (!path) {
      this.onChange();
      return;
    }
    void this.load(path).then((template) => {
      if (generation !== this.generation) {
        if (template) {
          disposeM2Template(template);
        }
        return;
      }
      this.template = template;
      if (template) {
        const mesh = new Mesh(template.geometry, template.materials.map(skyMaterial));
        mesh.renderOrder = -1;
        mesh.frustumCulled = false;
        mesh.userData = { radius: template.radius };
        this.group.add(mesh);
      }
      this.onChange();
    });
  }

  /** Keeps it around the camera, inside its far plane, turned `angle` radians about the vertical. */
  place(camera: { position: { x: number; y: number; z: number }; far: number }, angle = 0): void {
    const mesh = this.group.children[0] as Mesh | undefined;
    this.group.position.set(camera.position.x, camera.position.y, camera.position.z);
    this.group.rotation.y = angle;
    if (mesh) {
      mesh.scale.setScalar((camera.far * SKYBOX_DISTANCE) / Math.max(1, (mesh.userData as { radius: number }).radius));
    }
  }

  dispose(): void {
    this.generation++;
    this.clear();
  }

  private async load(path: string): Promise<M2Template | undefined> {
    try {
      const model = await this.source.getM2(path);
      if (!model) {
        return undefined;
      }
      const textures = await Promise.all(
        model.batches.map((batch) => (batch.texture ? this.textures.get(batch.texture) : Promise.resolve(this.textures.fallback))),
      );
      return buildM2Template(model, textures, this.textures.fallback);
    } catch (error) {
      console.warn(`[World Editor] Could not load the skybox ${path}: ${(error as Error).message}`);
      return undefined;
    }
  }

  private clear(): void {
    for (const child of [...this.group.children]) {
      ((child as Mesh).material as Material[]).forEach((material) => material.dispose());
      this.group.remove(child);
    }
    if (this.template) {
      disposeM2Template(this.template);
      this.template = undefined;
    }
  }
}

/** A skybox batch: seen from inside, behind everything (drawn first, writing no depth), unlit and without fog. */
function skyMaterial(material: Material): Material {
  const source = material as MeshBasicMaterial | MeshLambertMaterial;
  const sky = new MeshBasicMaterial({
    map: source.map,
    side: DoubleSide,
    blending: source.blending,
    alphaTest: source.alphaTest,
    // (kept among the opaque objects, so it's drawn before them; its blending still applies)
    transparent: false,
    depthWrite: false,
    fog: false,
  });
  return sky;
}
