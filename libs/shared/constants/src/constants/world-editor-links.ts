import { InjectionToken } from '@angular/core';

/**
 * Opens other Keira editors from the 3D world editor (its right-click menu). Provided by the app, which can reach the
 * creature and gameobject editors: feature libraries don't import each other.
 */
export interface WorldEditorLinks {
  openCreature(entry: number, name: string): void;
  /** Creature > entry > SAI. */
  openCreatureSai(entry: number, name: string): void;
  openGameObject(entry: number, name: string): void;
}

export const WORLD_EDITOR_LINKS = new InjectionToken<WorldEditorLinks>('WORLD_EDITOR_LINKS');
