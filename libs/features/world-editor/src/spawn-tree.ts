import { WowZone } from '@keira/shared/wow-data';
import { SpawnRecord, SpawnType, spawnKey } from './world-editor.model';

/**
 * The tree of what's loaded: zone → creatures / gameobjects → entry → each spawn. Every
 * node knows the spawns under it, so its tick box can hide or show them all.
 */
export interface SpawnTreeNode {
  id: string;
  kind: 'zone' | 'type' | 'entry' | 'spawn';
  /** Zone or entry name, the spawn's GUID; for a type node, its type. */
  label: string;
  type?: SpawnType;
  /** Keys of every spawn under it (or its own). */
  keys: string[];
  children: SpawnTreeNode[];
  spawn?: SpawnRecord;
}

/** A row of the tree as drawn: the node, how deep it is, and whether it's open. */
export interface SpawnTreeRow {
  node: SpawnTreeNode;
  depth: number;
  open: boolean;
}

/** The id of the zone node of spawns outside every zone. */
export const NO_ZONE = 'zone:none';

/**
 * Whether a text matches the filter: words with `*` (anything) and `?` (one character) match the whole text, other
 * words anywhere in it; `|` separates alternatives ("Caverns of Time|CoT"). Upper / lower case doesn't matter.
 */
export function treeMatcher(filter: string): (text: string) => boolean {
  const options = filter
    .split('|')
    .map((option) => option.trim().toLowerCase())
    .filter(Boolean)
    .map((option) => {
      if (!/[*?]/.test(option)) {
        return (text: string) => text.includes(option);
      }
      const escaped = option
        .replace(/[.+^${}()[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const pattern = new RegExp(`^${escaped}$`);
      return (text: string) => pattern.test(text);
    });
  return (text) => options.length === 0 || options.some((match) => match(text.toLowerCase()));
}

/** The smallest zone a spot is in (zones overlap: a city inside its region), if any. */
export function zoneAt(zones: WowZone[], x: number, y: number): WowZone | undefined {
  let best: WowZone | undefined;
  let bestArea = Infinity;
  for (const zone of zones) {
    const { minX, maxX, minY, maxY } = zone.bounds;
    const area = (maxX - minX) * (maxY - minY);
    if (x >= minX && x <= maxX && y >= minY && y <= maxY && area < bestArea) {
      [best, bestArea] = [zone, area];
    }
  }
  return best;
}

const TYPES: SpawnType[] = ['creature', 'gameobject'];

/**
 * The tree of the spawns, by zone, type and entry (each sorted by name), keeping only the spawns the filter matches
 * by zone name, entry name or number, or GUID.
 */
export function buildSpawnTree(spawns: SpawnRecord[], zones: WowZone[], filter = ''): SpawnTreeNode[] {
  const matches = treeMatcher(filter);
  const byZone = new Map<string, { label: string; spawns: SpawnRecord[] }>();
  for (const spawn of spawns) {
    const zone = zoneAt(zones, spawn.x, spawn.y);
    const name = spawn.name || String(spawn.entry);
    if (filter.trim() && !matches(zone?.name ?? '') && !matches(name) && !matches(String(spawn.entry)) && !matches(String(spawn.guid))) {
      continue;
    }
    const id = zone ? `zone:${zone.areaId}` : NO_ZONE;
    const group = byZone.get(id) ?? { label: zone?.name ?? '', spawns: [] };
    group.spawns.push(spawn);
    byZone.set(id, group);
  }
  const byName = (a: SpawnTreeNode, b: SpawnTreeNode): number => a.label.localeCompare(b.label);
  return [...byZone.entries()]
    .map(([id, group]) => {
      const types = TYPES.map((type) => {
        const entries = new Map<number, SpawnRecord[]>();
        for (const spawn of group.spawns.filter((s) => s.type === type)) {
          entries.set(spawn.entry, [...(entries.get(spawn.entry) ?? []), spawn]);
        }
        const children = [...entries.entries()]
          .map(([entry, list]): SpawnTreeNode => {
            const spawnNodes = list
              .sort((a, b) => a.guid - b.guid)
              .map((spawn): SpawnTreeNode => ({
                id: spawnKey(type, spawn.guid),
                kind: 'spawn',
                label: String(spawn.guid),
                type,
                keys: [spawnKey(type, spawn.guid)],
                children: [],
                spawn,
              }));
            return {
              id: `${id}:${type}:${entry}`,
              kind: 'entry',
              label: `${list[0].name || '?'} (${entry})`,
              type,
              keys: spawnNodes.map((node) => node.id),
              children: spawnNodes,
            };
          })
          .sort(byName);
        return {
          id: `${id}:${type}`,
          kind: 'type' as const,
          label: type,
          type,
          keys: children.flatMap((child) => child.keys),
          children,
        };
      }).filter((node) => node.children.length);
      return { id, kind: 'zone' as const, label: group.label, keys: types.flatMap((t) => t.keys), children: types };
    })
    .sort((a, b) => (a.id === NO_ZONE ? 1 : b.id === NO_ZONE ? -1 : byName(a, b)));
}

/** The rows to draw: every node whose parents are all open. */
export function treeRows(nodes: SpawnTreeNode[], open: ReadonlySet<string>, depth = 0): SpawnTreeRow[] {
  return nodes.flatMap((node) => {
    const isOpen = open.has(node.id);
    return [{ node, depth, open: isOpen }, ...(isOpen ? treeRows(node.children, open, depth + 1) : [])];
  });
}

/** Every node that can open (has children), for Expand all. */
export function openableIds(nodes: SpawnTreeNode[]): string[] {
  return nodes.flatMap((node) => (node.children.length ? [node.id, ...openableIds(node.children)] : []));
}

/** Whether a node's spawns are all shown, none, or some (its tick box: ticked, empty or half). */
export function checkState(keys: string[], hidden: ReadonlySet<string>): 'all' | 'none' | 'some' {
  const shown = keys.filter((key) => !hidden.has(key)).length;
  return shown === keys.length ? 'all' : shown === 0 ? 'none' : 'some';
}

/** The hidden spawns after ticking (show) or unticking (hide) some. */
export function setShown(hidden: ReadonlySet<string>, keys: string[], show: boolean): Set<string> {
  const next = new Set(hidden);
  for (const key of keys) {
    if (show) {
      next.delete(key);
    } else {
      next.add(key);
    }
  }
  return next;
}
