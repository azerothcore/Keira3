import { formationLinks, formationSlots, groupDetails, poolOverlays, FORMATION_COLOR } from './spawn-groups';
import { FormationMember, PoolMember, SpawnRecord } from './world-editor.model';

const spawn = (type: 'creature' | 'gameobject', guid: number, x: number, y: number, extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type,
  guid,
  entry: 100 + guid,
  name: `Spawn ${guid}`,
  map: 0,
  x,
  y,
  z: 10,
  o: 0,
  pathId: 0,
  ...extra,
});

describe('spawn groups', () => {
  const spawns = [
    spawn('creature', 1, 0, 0),
    spawn('creature', 2, 3, 0),
    spawn('creature', 3, 0, 3, { name: '' }),
    spawn('gameobject', 4, 10, 10),
  ];
  const formations: FormationMember[] = [
    { leader: 1, member: 1, dist: 0, angle: 0, groupAI: 0 },
    { leader: 1, member: 2, dist: 3, angle: 90, groupAI: 512 },
    { leader: 1, member: 3, dist: 2, angle: 0, groupAI: 0 },
    { leader: 1, member: 9, dist: 2, angle: 180, groupAI: 0 },
  ];

  it('links formation members to their leader', () => {
    expect(formationLinks(spawns, formations)).toEqual([
      { key: 'formation:1:2', from: { x: 3, y: 0, z: 10 }, to: { x: 0, y: 0, z: 10 }, color: FORMATION_COLOR, arrow: true, dashed: true },
      { key: 'formation:1:3', from: { x: 0, y: 3, z: 10 }, to: { x: 0, y: 0, z: 10 }, color: FORMATION_COLOR, arrow: true, dashed: true },
    ]);
  });

  it("marks where the selected creature's formation members walk, from the leader's facing", () => {
    const slots = formationSlots(spawns, formations, spawns[1]);
    expect(slots.map((slot) => slot.key)).toEqual(['formation-slot:2', 'formation-slot:3', 'formation-slot:9']);
    expect(slots[1].label).toContain('Formation place of 103 (3):');
    expect(slots[0].position.x).toBeCloseTo(0);
    expect(slots[0].position.y).toBeCloseTo(3);
    expect(slots[0].label).toBe("Formation place of Spawn 2 (2): 3 yd, 90° from Spawn 1 (1)'s facing");
    expect(slots[2].label).toContain('Formation place of 9:');
    expect(formationSlots(spawns, formations, spawns[3])).toEqual([]);
    expect(formationSlots(spawns, formations, undefined)).toEqual([]);
    expect(formationSlots([spawns[1]], formations, spawns[1])).toEqual([]);
  });

  it('labels pools above their loaded spawns, linked to each', () => {
    const pools: PoolMember[] = [
      { type: 'gameobject', guid: 4, pool: 7, chance: 0, maxLimit: 1, description: 'Copper veins' },
      { type: 'creature', guid: 2, pool: 7, chance: 0, maxLimit: 1, description: 'Copper veins' },
      { type: 'creature', guid: 3, pool: 8, chance: 50, maxLimit: 0, description: '' },
      { type: 'creature', guid: 99, pool: 9, chance: 0, maxLimit: 0, description: '' },
    ];
    const { links, markers } = poolOverlays(spawns, pools);
    expect(markers.map((m) => m.label)).toEqual([
      'Pool 7: Copper veins - 1 of 2 up at once (loaded spawns)',
      'Pool 8 - all 1 up (loaded spawns)',
    ]);
    expect(markers[0].position).toEqual({ x: 6.5, y: 5, z: 13 });
    expect(links.map((l) => l.key)).toEqual(['pool:7:gameobject:4', 'pool:7:creature:2', 'pool:8:creature:3']);
  });

  it('describes the formation and pool of a spawn on hover', () => {
    const pools: PoolMember[] = [
      { type: 'creature', guid: 1, pool: 7, chance: 25, maxLimit: 1, description: 'Rares' },
      { type: 'creature', guid: 2, pool: 8, chance: 0, maxLimit: 0, description: '' },
    ];
    expect(groupDetails(spawns[0], formations, pools)).toEqual(['Formation leader (3 members)', 'Pool 7 (Rares), chance 25%']);
    expect(groupDetails(spawns[1], formations, pools)).toEqual(['In the formation of 1: 3 yd, 90°', 'Pool 8']);
    expect(groupDetails(spawns[3], formations, pools)).toEqual([]);
  });
});
