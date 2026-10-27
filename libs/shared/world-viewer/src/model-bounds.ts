import { SpawnKind } from './world-viewer.model';
import { SpawnModelSource } from './spawn-models';

/** A box around a model in its own server-like axes (x forward, y left, z up), already scaled; corners [x, y, z]. */
export interface ModelBox {
  min: [number, number, number];
  max: [number, number, number];
}

/**
 * The box around a spawn's model, from its collision when it has one (what objects meet at), its mesh otherwise.
 * Undefined when the display or its model can't be read.
 */
export async function spawnModelBox(
  source: SpawnModelSource,
  kind: SpawnKind,
  displayId: number,
  spawnScale = 1,
): Promise<ModelBox | undefined> {
  const display =
    kind === 'creature'
      ? await source.getCreatureDisplay(displayId)
      : await source.getGameObjectDisplay(displayId).then((model) => (model ? { model, scale: 1 } : undefined));
  const mesh = display && (await source.getM2(display.model));
  if (!display || !mesh) {
    return undefined;
  }
  const positions = mesh.collision.positions.length > 0 ? mesh.collision.positions : mesh.positions;
  if (positions.length === 0) {
    return undefined;
  }
  const scale = display.scale * spawnScale;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    // scene (−y, z, −x) → model (x, y, z)
    const point = [-positions[i + 2], -positions[i], positions[i + 1]];
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], point[axis] * scale);
      max[axis] = Math.max(max[axis], point[axis] * scale);
    }
  }
  return { min, max };
}
