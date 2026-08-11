import {
  assignDepths,
  buildQuestChainGraph,
  collectExclusiveGroups,
  H_GAP,
  NODE_HEIGHT,
  NODE_WIDTH,
  PADDING,
  V_GAP,
} from './quest-chain.layout';
import { QuestChainEdge, QuestChainEntry } from './quest-chain.model';

const entry = (id: number, exclusiveGroup = 0, missing = false, conditionCount = 0): QuestChainEntry => ({
  id,
  title: `Quest ${id}`,
  missing,
  exclusiveGroup,
  conditionCount,
});

const chain = (from: number, to: number): QuestChainEdge => ({ from, to, kind: 'chain' });

describe('quest-chain layout', () => {
  describe('collectExclusiveGroups', () => {
    it('should ignore quests without a group', () => {
      expect(collectExclusiveGroups([entry(1), entry(2)]).size).toBe(0);
    });

    it('should drop groups that have a single member, since one quest is not an alternative', () => {
      expect(collectExclusiveGroups([entry(1, 55), entry(2, 66), entry(3, 66)])).toEqual(new Map([[66, [2, 3]]]));
    });

    it('should keep negative groups', () => {
      expect(collectExclusiveGroups([entry(1, -12), entry(2, -12)])).toEqual(new Map([[-12, [1, 2]]]));
    });
  });

  describe('assignDepths', () => {
    it('should place prerequisites before and follow-ups after the current quest', () => {
      const depths = assignDepths([1, 2, 3], [chain(1, 2), chain(2, 3)], new Map(), 2);

      expect([...depths]).toEqual([
        [2, 1],
        [3, 2],
        [1, 0],
      ]);
    });

    it('should start from the first id when the current quest is not part of the graph', () => {
      const depths = assignDepths([1, 2], [chain(1, 2)], new Map(), 999);

      expect(depths.get(1)).toBe(0);
      expect(depths.get(2)).toBe(1);
    });

    it('should level members of an exclusive group', () => {
      // 3 is reachable only through 2, so without group levelling it would sit one layer deeper than 2.
      const depths = assignDepths([1, 2, 3], [chain(1, 2), chain(2, 3)], new Map([[7, [2, 3]]]), 1);

      expect(depths.get(2)).toBe(depths.get(3));
    });

    it('should push a node forward when a longer path reaches it', () => {
      // 1 -> 3 directly, but also 1 -> 2 -> 3: the longer path wins so the edge still points forward.
      const depths = assignDepths([1, 2, 3], [chain(1, 3), chain(1, 2), chain(2, 3)], new Map(), 1);

      expect(depths.get(3)).toBe(2);
    });

    it('should put disconnected quests on the first layer', () => {
      const depths = assignDepths([1, 2, 9], [chain(1, 2)], new Map(), 1);

      expect(depths.get(9)).toBe(0);
    });

    it('should terminate on cyclic data instead of spinning', () => {
      const depths = assignDepths([1, 2], [chain(1, 2), chain(2, 1)], new Map(), 1);

      expect(depths.size).toBe(2);
    });

    it('should shift the whole graph so the shallowest quest sits on layer zero', () => {
      const depths = assignDepths([1, 2], [chain(1, 2)], new Map(), 2);

      expect(Math.min(...depths.values())).toBe(0);
    });
  });

  describe('buildQuestChainGraph', () => {
    it('should return an empty graph when there is nothing to draw', () => {
      expect(buildQuestChainGraph([], [], 1)).toEqual({ nodes: [], edges: [], bands: [], width: 0, height: 0, truncated: false });
    });

    it('should default truncated to false', () => {
      expect(buildQuestChainGraph([entry(1)], [], 1).truncated).toBe(false);
    });

    it('should mark the current quest', () => {
      const graph = buildQuestChainGraph([entry(1), entry(2)], [chain(1, 2)], 2);

      expect(graph.nodes.find((node) => node.id === 2)?.isCurrent).toBe(true);
      expect(graph.nodes.find((node) => node.id === 1)?.isCurrent).toBe(false);
    });

    it('should deduplicate repeated entries', () => {
      expect(buildQuestChainGraph([entry(1), entry(1)], [], 1).nodes.length).toBe(1);
    });

    it('should drop edges pointing outside the graph and self-edges', () => {
      const edges = [chain(1, 2), chain(1, 404), chain(404, 1), chain(1, 1)];

      expect(buildQuestChainGraph([entry(1), entry(2)], edges, 1).edges).toEqual([
        expect.objectContaining({ from: 1, to: 2, kind: 'chain' }),
      ]);
    });

    it('should lay layers out left to right', () => {
      const graph = buildQuestChainGraph([entry(1), entry(2)], [chain(1, 2)], 1);
      const [first, second] = [graph.nodes[0], graph.nodes[1]];

      expect(first.x).toBe(PADDING);
      expect(second.x).toBe(PADDING + NODE_WIDTH + H_GAP);
    });

    it('should stack quests of the same layer and centre shorter layers', () => {
      // Layer 1 holds two follow-ups; layer 0 holds only the root, which is centred against them.
      const graph = buildQuestChainGraph([entry(1), entry(2), entry(3)], [chain(1, 2), chain(1, 3)], 1);
      const root = graph.nodes.find((node) => node.id === 1);
      const followUps = graph.nodes.filter((node) => node.id !== 1).sort((a, b) => a.y - b.y);

      expect(followUps[1].y - followUps[0].y).toBe(NODE_HEIGHT + V_GAP);
      expect(root?.y).toBe(PADDING + Math.round((NODE_HEIGHT + V_GAP) / 2));
    });

    it('should draw a forward edge as a left-to-right curve', () => {
      const graph = buildQuestChainGraph([entry(1), entry(2)], [chain(1, 2)], 1);

      expect(graph.edges[0].path).toContain(`M ${PADDING + NODE_WIDTH} `);
      expect(graph.edges[0].path).toContain(' C ');
    });

    it('should route a right-to-left edge underneath the boxes', () => {
      // Cyclic data: whichever of the two edges ends up pointing backwards must not cut through the boxes.
      const graph = buildQuestChainGraph([entry(1), entry(2)], [chain(1, 2), { from: 2, to: 1, kind: 'chain' }], 1);
      const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
      const backward = graph.edges.find((edge) => {
        const from = nodeById.get(edge.from) as { x: number };
        return (nodeById.get(edge.to) as { x: number }).x < from.x + NODE_WIDTH;
      });
      const source = nodeById.get(backward?.from as number) as { x: number; y: number };

      // A backward edge leaves the bottom of its source, not the right-hand side.
      expect(backward?.path.startsWith(`M ${source.x + NODE_WIDTH / 2} ${source.y + NODE_HEIGHT}`)).toBe(true);
    });

    it('should box an exclusive group and classify it by sign', () => {
      const entries = [entry(1), entry(2, 40), entry(3, 40), entry(4, -50), entry(5, -50)];
      const edges = [chain(1, 2), chain(1, 3), chain(1, 4), chain(1, 5)];
      const graph = buildQuestChainGraph(entries, edges, 1);

      // The caption itself is built in the template so that it goes through i18n.
      expect(graph.bands.map((band) => [band.group, band.kind])).toEqual([
        [-50, 'all'],
        [40, 'any'],
      ]);
    });

    it('should size the canvas around the group box, which reaches past the nodes', () => {
      const graph = buildQuestChainGraph([entry(1, 9), entry(2, 9)], [], 1);
      const band = graph.bands[0];

      expect(graph.width).toBe(band.x + band.width + PADDING);
      expect(graph.width).toBeGreaterThan(Math.max(...graph.nodes.map((node) => node.x + NODE_WIDTH)) + PADDING);
      expect(graph.height).toBe(band.y + band.height + PADDING);
    });

    it('should size the canvas around the nodes when there is no group box', () => {
      const graph = buildQuestChainGraph([entry(1), entry(2)], [chain(1, 2)], 1);

      expect(graph.width).toBe(Math.max(...graph.nodes.map((node) => node.x + NODE_WIDTH)) + PADDING);
      expect(graph.height).toBe(Math.max(...graph.nodes.map((node) => node.y + NODE_HEIGHT)) + PADDING);
    });

    it('should carry the missing flag and the truncated flag through', () => {
      const graph = buildQuestChainGraph([entry(1), entry(2, 0, true)], [chain(1, 2)], 1, true);

      expect(graph.nodes.find((node) => node.id === 2)?.missing).toBe(true);
      expect(graph.truncated).toBe(true);
    });

    it('should carry the condition count onto the node', () => {
      const graph = buildQuestChainGraph([entry(1, 0, false, 3), entry(2)], [chain(1, 2)], 1);

      expect(graph.nodes.find((node) => node.id === 1)?.conditionCount).toBe(3);
      expect(graph.nodes.find((node) => node.id === 2)?.conditionCount).toBe(0);
    });
  });
});
