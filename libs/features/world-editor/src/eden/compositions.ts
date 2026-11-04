import { Service, signal } from '@angular/core';
import { CopiedSpawn } from '../group-edit';
import { SpawnRecord } from '../world-editor.model';

export const COMPOSITIONS_KEY = 'keira3.worldEditor.compositions';

/**
 * Eden's custom composition: spawns saved together (a camp, a patrol), placed again anywhere as new spawns. Each is kept
 * with where it stands from the composition's anchor: its centre, at the height of its lowest spawn.
 */
export interface Composition {
  id: string;
  name: string;
  members: CopiedSpawn[];
}

const round = (value: number): number => Math.round(value * 1000) / 1000;

/** A composition of spawns (what a copy of them is made of: no paths, events or scripts of their own). */
export function compositionFrom(name: string, spawns: SpawnRecord[], id = `${Date.now()}`): Composition {
  const centre = {
    x: spawns.reduce((sum, spawn) => sum + spawn.x, 0) / spawns.length,
    y: spawns.reduce((sum, spawn) => sum + spawn.y, 0) / spawns.length,
    z: Math.min(...spawns.map((spawn) => spawn.z)),
  };
  return {
    id,
    name,
    members: spawns.map(({ pathFromTemplate: _, event: __, saiPaths: ___, ...spawn }) => ({
      spawn: { ...spawn, pathId: 0 },
      offset: { x: round(spawn.x - centre.x), y: round(spawn.y - centre.y), z: round(spawn.z - centre.z) },
    })),
  };
}

function isComposition(value: unknown): value is Composition {
  const composition = value as Composition;
  return typeof composition?.id === 'string' && typeof composition.name === 'string' && Array.isArray(composition.members);
}

function load(): Composition[] {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPOSITIONS_KEY) ?? '[]') as unknown;
    return Array.isArray(stored) ? stored.filter(isComposition) : [];
  } catch {
    return [];
  }
}

/** The compositions saved on this computer. */
@Service()
export class CompositionsService {
  private readonly _compositions = signal<Composition[]>(load());
  readonly compositions = this._compositions.asReadonly();

  private keep(compositions: Composition[]): void {
    this._compositions.set(compositions);
    try {
      localStorage.setItem(COMPOSITIONS_KEY, JSON.stringify(compositions));
    } catch {
      // (not kept)
    }
  }

  /** Saves a composition; one of the same name is replaced (Eden's overwrite). */
  save(composition: Composition): void {
    this.keep(
      [...this.compositions().filter((other) => other.name !== composition.name), composition].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  remove(id: string): void {
    this.keep(this.compositions().filter((composition) => composition.id !== id));
  }
}
