import { SpawnRecord } from './world-editor.model';

/** Which spawns the 3D view shows, besides the creature/gameobject/waypoint layers. */
export interface SpawnFilters {
  /** Game events (game_event.eventEntry) whose spawns are shown; spawns of other events are hidden. */
  events: number[];
  /** Invisible triggers, "[DND]" bunnies and other helper creatures/objects players never see. */
  showTriggers: boolean;
  /** Spawns not in phase 1 (the phase players start in). */
  showOtherPhases: boolean;
  /** Only spawns whose name, entry or guid contains this text. */
  search: string;
}

export const DEFAULT_SPAWN_FILTERS: SpawnFilters = { events: [], showTriggers: false, showOtherPhases: true, search: '' };

export const SPAWN_FILTERS_KEY = 'keira3.worldEditor.filters';

/** A game event with spawns among the loaded ones. */
export interface SpawnEvent {
  id: number;
  name: string;
  spawns: number;
}

export function isSpawnVisible(spawn: SpawnRecord, filters: SpawnFilters): boolean {
  if (spawn.event && !filters.events.includes(spawn.event)) {
    return false;
  }
  if (spawn.trigger && !filters.showTriggers) {
    return false;
  }
  if (!filters.showOtherPhases && spawn.phaseMask !== undefined && (spawn.phaseMask & 1) === 0) {
    return false;
  }
  const search = filters.search.trim().toLowerCase();
  return !search || [spawn.name.toLowerCase(), String(spawn.entry), String(spawn.guid)].some((text) => text.includes(search));
}

/** The events of the given spawns with how many spawns each has, sorted by name. */
export function spawnEvents(spawns: SpawnRecord[], names: Map<number, string>): SpawnEvent[] {
  const counts = new Map<number, number>();
  for (const spawn of spawns) {
    if (spawn.event) {
      counts.set(spawn.event, (counts.get(spawn.event) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([id, count]) => ({ id, name: names.get(id) || `Event ${id}`, spawns: count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function loadSpawnFilters(): SpawnFilters {
  try {
    const stored = JSON.parse(localStorage.getItem(SPAWN_FILTERS_KEY) ?? '{}') as Partial<SpawnFilters>;
    return {
      events: Array.isArray(stored.events) ? stored.events.filter((id) => typeof id === 'number') : [],
      showTriggers: typeof stored.showTriggers === 'boolean' ? stored.showTriggers : DEFAULT_SPAWN_FILTERS.showTriggers,
      showOtherPhases: typeof stored.showOtherPhases === 'boolean' ? stored.showOtherPhases : DEFAULT_SPAWN_FILTERS.showOtherPhases,
      search: typeof stored.search === 'string' ? stored.search : '',
    };
  } catch {
    return DEFAULT_SPAWN_FILTERS;
  }
}

export function saveSpawnFilters(filters: SpawnFilters): void {
  localStorage.setItem(SPAWN_FILTERS_KEY, JSON.stringify(filters));
}
