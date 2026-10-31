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
  /** Gameobject > entry > SAI. */
  openGameObjectSai(entry: number, name: string): void;
  /** The SAI editor for an area trigger (source type 2), new when it has none. */
  openAreaTriggerSai(id: number): void;
  /** A loot editor of a creature or gameobject entry. */
  openLoot(kind: WorldEditorLoot, entry: number, name: string): void;
  /** The Waypoint Editor for a path (`waypoint_data.id`), or the SmartAI Path Editor for a SmartAI path (negative: `-waypoints.entry`). */
  openPath(pathId: number): void;
  /** The Waypoint Scripts editor for a waypoint action (`waypoint_scripts.id`). */
  openWaypointScript(id: number): void;
  /** The Pool Editor for a pool (`pool_template.entry`). */
  openPool(id: number): void;
}

export type WorldEditorLoot = 'creature' | 'pickpocketing' | 'skinning' | 'gameobject';

export const WORLD_EDITOR_LINKS = new InjectionToken<WorldEditorLinks>('WORLD_EDITOR_LINKS');
