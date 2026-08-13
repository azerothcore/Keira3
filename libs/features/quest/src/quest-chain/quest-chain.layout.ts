import {
  EMPTY_QUEST_CHAIN_GRAPH,
  QuestChainEdge,
  QuestChainEntry,
  QuestChainGraph,
  QuestChainGroupBand,
  QuestChainNode,
  QuestChainRenderEdge,
} from './quest-chain.model';

export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 54;
export const H_GAP = 74;
export const V_GAP = 28;
/** Slack between a group's members and the box drawn around them. */
export const BAND_INSET = 9;
/** Vertical room reserved above a group box for its caption. */
export const BAND_LABEL_SPACE = 16;
export const PADDING = 34;

function pushInto(map: Map<number, number[]>, key: number, value: number): void {
  const existing = map.get(key);

  if (existing) {
    existing.push(value);
  } else {
    map.set(key, [value]);
  }
}

/** Members of every `ExclusiveGroup` that has more than one quest in the graph. A lone member is not a group. */
export function collectExclusiveGroups(entries: QuestChainEntry[]): Map<number, number[]> {
  const groups = new Map<number, number[]>();

  for (const entry of entries) {
    if (entry.exclusiveGroup !== 0) {
      pushInto(groups, entry.exclusiveGroup, entry.id);
    }
  }

  for (const [group, members] of groups) {
    if (members.length < 2) {
      groups.delete(group);
    }
  }

  return groups;
}

/**
 * Puts every quest on a layer: the current quest at 0, prerequisites to its left, follow-ups to its right.
 * Members of an exclusive group are pulled onto a shared layer so they read as alternatives side by side.
 */
export function assignDepths(
  ids: number[],
  edges: QuestChainEdge[],
  groups: Map<number, number[]>,
  currentId: number,
): Map<number, number> {
  const depth = new Map<number, number>();
  const idSet = new Set(ids);
  // Every id is seeded below before this is used for reads, so the lookup always hits.
  const depthOf = (id: number): number => depth.get(id) as number;

  const outgoing = new Map<number, number[]>();
  const incoming = new Map<number, number[]>();

  for (const edge of edges) {
    pushInto(outgoing, edge.from, edge.to);
    pushInto(incoming, edge.to, edge.from);
  }

  const siblings = new Map<number, number[]>();

  for (const members of groups.values()) {
    for (const member of members) {
      siblings.set(
        member,
        members.filter((other) => other !== member),
      );
    }
  }

  // Seed by sweeping outwards from the current quest, which is where expansion started.
  const start = idSet.has(currentId) ? currentId : ids[0];
  const queue: number[] = [start];
  depth.set(start, 0);

  while (queue.length > 0) {
    const node = queue.shift() as number;
    const base = depthOf(node);

    const visit = (next: number, value: number): void => {
      if (idSet.has(next) && !depth.has(next)) {
        depth.set(next, value);
        queue.push(next);
      }
    };

    for (const next of outgoing.get(node) ?? []) {
      visit(next, base + 1);
    }
    for (const previous of incoming.get(node) ?? []) {
      visit(previous, base - 1);
    }
    for (const sibling of siblings.get(node) ?? []) {
      visit(sibling, base);
    }
  }

  // Anything the sweep could not reach (only possible with contradictory data) lands on the first layer.
  for (const id of ids) {
    if (!depth.has(id)) {
      depth.set(id, 0);
    }
  }

  // Relax until every edge points forward and each group is level. Bounded, so cyclic data cannot spin here.
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false;

    for (const edge of edges) {
      const wanted = depthOf(edge.from) + 1;

      if (depthOf(edge.to) < wanted) {
        depth.set(edge.to, wanted);
        changed = true;
      }
    }

    for (const members of groups.values()) {
      const deepest = Math.max(...members.map(depthOf));

      for (const member of members) {
        if (depthOf(member) < deepest) {
          depth.set(member, deepest);
          changed = true;
        }
      }
    }

    if (!changed) {
      break;
    }
  }

  const shallowest = Math.min(...depth.values());

  for (const [id, value] of depth) {
    depth.set(id, value - shallowest);
  }

  return depth;
}

function buildEdgePath(from: QuestChainNode, to: QuestChainNode): string {
  const startX = from.x + NODE_WIDTH;
  const startY = Math.round(from.y + NODE_HEIGHT / 2);
  const endY = Math.round(to.y + NODE_HEIGHT / 2);

  if (to.x >= startX) {
    const control = Math.round(Math.max((to.x - startX) / 2, 18));
    return `M ${startX} ${startY} C ${startX + control} ${startY}, ${to.x - control} ${endY}, ${to.x} ${endY}`;
  }

  // Backward or same-layer link: route underneath so the curve does not cut straight through the boxes.
  const fromMid = Math.round(from.x + NODE_WIDTH / 2);
  const toMid = Math.round(to.x + NODE_WIDTH / 2);
  const drop = Math.round(Math.max(from.y, to.y) + NODE_HEIGHT + V_GAP / 2);

  return `M ${fromMid} ${from.y + NODE_HEIGHT} C ${fromMid} ${drop}, ${toMid} ${drop}, ${toMid} ${to.y + NODE_HEIGHT}`;
}

function buildBands(nodes: QuestChainNode[], groups: Map<number, number[]>): QuestChainGroupBand[] {
  const bands: QuestChainGroupBand[] = [];

  for (const group of [...groups.keys()].sort((a, b) => a - b)) {
    // Groups are derived from these same nodes, so a group always has members here.
    const members = nodes.filter((node) => node.exclusiveGroup === group);

    const left = Math.min(...members.map((node) => node.x)) - BAND_INSET;
    const top = Math.min(...members.map((node) => node.y)) - BAND_INSET - BAND_LABEL_SPACE;
    const right = Math.max(...members.map((node) => node.x + NODE_WIDTH)) + BAND_INSET;
    const bottom = Math.max(...members.map((node) => node.y + NODE_HEIGHT)) + BAND_INSET;

    bands.push({
      group,
      kind: group > 0 ? 'any' : 'all',
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    });
  }

  return bands;
}

/** Turns the walked quest chain into positioned nodes, ready-to-draw edge paths and exclusive-group boxes. */
export function buildQuestChainGraph(
  entries: QuestChainEntry[],
  edges: QuestChainEdge[],
  currentId: number,
  truncated = false,
): QuestChainGraph {
  if (entries.length === 0) {
    return { ...EMPTY_QUEST_CHAIN_GRAPH };
  }

  const unique = new Map<number, QuestChainEntry>();

  for (const entry of entries) {
    unique.set(entry.id, entry);
  }

  const ids = [...unique.keys()];
  const validEdges = edges.filter((edge) => unique.has(edge.from) && unique.has(edge.to) && edge.from !== edge.to);
  const groups = collectExclusiveGroups([...unique.values()]);
  const depths = assignDepths(ids, validEdges, groups, currentId);

  const layers = new Map<number, QuestChainEntry[]>();

  for (const id of ids) {
    const layerDepth = depths.get(id) as number;
    const layer = layers.get(layerDepth);

    if (layer) {
      layer.push(unique.get(id) as QuestChainEntry);
    } else {
      layers.set(layerDepth, [unique.get(id) as QuestChainEntry]);
    }
  }

  const tallest = Math.max(...[...layers.values()].map((layer) => layer.length));
  const nodes: QuestChainNode[] = [];

  for (const [layerDepth, layer] of layers) {
    // Keep members of the same exclusive group adjacent, so one box can enclose them all.
    layer.sort((a, b) => a.exclusiveGroup - b.exclusiveGroup || a.id - b.id);

    const offset = Math.round(((tallest - layer.length) * (NODE_HEIGHT + V_GAP)) / 2);

    layer.forEach((entry, row) => {
      nodes.push({
        id: entry.id,
        title: entry.title,
        missing: entry.missing,
        isCurrent: entry.id === currentId,
        exclusiveGroup: entry.exclusiveGroup,
        conditionCount: entry.conditionCount,
        depth: layerDepth,
        x: PADDING + layerDepth * (NODE_WIDTH + H_GAP),
        y: PADDING + offset + row * (NODE_HEIGHT + V_GAP),
      });
    });
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const renderEdges: QuestChainRenderEdge[] = validEdges.map((edge) => ({
    ...edge,
    path: buildEdgePath(nodeById.get(edge.from) as QuestChainNode, nodeById.get(edge.to) as QuestChainNode),
  }));

  const bands = buildBands(nodes, groups);
  const width = Math.max(...nodes.map((node) => node.x + NODE_WIDTH), ...bands.map((band) => band.x + band.width)) + PADDING;
  const height = Math.max(...nodes.map((node) => node.y + NODE_HEIGHT), ...bands.map((band) => band.y + band.height)) + PADDING;

  return { nodes, edges: renderEdges, bands, width, height, truncated };
}
