import { boundaryOutline, describeBoundary, parseBossScripts, parseInstanceBoundaries, parseMapConstants } from './boss-boundaries';

const INSTANCE = `
#include "AreaBoundary.h"
BossBoundaryData const boundaries =
{
    /* Arachnid Quarter */
    { BOSS_ANUB,      new CircleBoundary(Position(10.0f, 0.0f), Position(13.0f, 4.0f)) },
    { BOSS_FAERLINA,  new RectangleBoundary(3315.0f, 3402.0f, -3727.0f, -3590.0f, true) }, // keeps out
    { BOSS_HEIGAN,    new CircleBoundary(Position(2772.57f, -3685.28f), 56.0f) },
    { BOSS_SINDRA,    new EllipseBoundary(Position(4418.6f, 2484.0f), 110.0, 75.0) },
    { BOSS_THADDIUS,  new ParallelogramBoundary(Position(0.0f, 0.0f, 5.0f), Position(10.0f, 0.0f), Position(0.0f, 5.0f)) },
    { BOSS_TRI,       new TriangleBoundary(Position(0, 0), Position(1, 0), Position(0, 1)) },
    { BOSS_RAZUVIOUS, new ZRangeBoundary(260.0f, 287.0f) },
    { BOSS_PIT,       new BoundaryIntersectBoundary(new RectangleBoundary(1.f, 2.f, 3.f, 4.f), new ZRangeBoundary(.5, 1e2)) },
    { BOSS_ONE,       new BoundaryUnionBoundary(new ZRangeBoundary(1, 2), new ZRangeBoundary(3, 4), false) },
    { BOSS_ODD,       new SomethingElseBoundary(1.0f) },
    { BOSS_NAMED,     new CircleBoundary(CenterPosition, 5.0f) },
    { BOSS_BROKEN,    new RectangleBoundary(1.0f, ) }
};
class instance_naxxramas : public InstanceMapScript { };
void AddSC() { RegisterInstanceScript(instance_naxxramas, MAP_NAXXRAMAS); }
`;

describe('boss boundaries', () => {
  it('reads the map constants', () => {
    expect(parseMapConstants('enum { MAP_NAXXRAMAS = 533, MAP_ULDUAR  =  603 };')).toEqual(
      new Map([
        ['MAP_NAXXRAMAS', 533],
        ['MAP_ULDUAR', 603],
      ]),
    );
  });

  it("reads an instance's boss boundaries, every kind of shape, skipping what it can't read", () => {
    const parsed = parseInstanceBoundaries(INSTANCE);
    expect(parsed?.instance).toBe('instance_naxxramas');
    expect(parsed?.map).toBe('MAP_NAXXRAMAS');
    const shapes = Object.fromEntries((parsed?.entries ?? []).map((e) => [e.boss, e.shape]));
    expect(Object.keys(shapes)).not.toContain('BOSS_ODD');
    // a named constant can't be read from here
    expect(Object.keys(shapes)).not.toContain('BOSS_NAMED');
    expect(Object.keys(shapes)).not.toContain('BOSS_BROKEN');
    expect(shapes['BOSS_ANUB']).toEqual({ type: 'circle', center: { x: 10, y: 0 }, radius: 5, inverted: false });
    expect(shapes['BOSS_FAERLINA']).toEqual({ type: 'rectangle', minX: 3315, maxX: 3402, minY: -3727, maxY: -3590, inverted: true });
    expect(shapes['BOSS_HEIGAN']).toEqual(expect.objectContaining({ type: 'circle', radius: 56 }));
    expect(shapes['BOSS_SINDRA']).toEqual({ type: 'ellipse', center: { x: 4418.6, y: 2484 }, radiusX: 110, radiusY: 75, inverted: false });
    // corner C = B + D − A
    expect(shapes['BOSS_THADDIUS']).toEqual(
      expect.objectContaining({
        type: 'parallelogram',
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 5 },
          { x: 0, y: 5 },
        ],
      }),
    );
    expect(shapes['BOSS_TRI']).toEqual(expect.objectContaining({ type: 'triangle' }));
    expect(shapes['BOSS_RAZUVIOUS']).toEqual({ type: 'zrange', minZ: 260, maxZ: 287, inverted: false });
    expect(shapes['BOSS_PIT']).toEqual({
      type: 'intersect',
      shapes: [
        { type: 'rectangle', minX: 1, maxX: 2, minY: 3, maxY: 4, inverted: false },
        { type: 'zrange', minZ: 0.5, maxZ: 100, inverted: false },
      ],
      inverted: false,
    });
    expect(shapes['BOSS_ONE']).toEqual(expect.objectContaining({ type: 'union' }));
  });

  it('needs an instance script and its boundaries, and reads a quoted or constant script name', () => {
    expect(parseInstanceBoundaries('BossBoundaryData const boundaries = { };')).toBeUndefined();
    expect(parseInstanceBoundaries('InstanceMapScript("instance_x", 1)')).toBeUndefined();
    const unclosed = parseInstanceBoundaries(
      'InstanceMapScript(ICCScriptName, MAP_ICC) BossBoundaryData const b = { { DATA_A, new ZRangeBoundary(1, 2) }',
    );
    expect(unclosed).toEqual({ instance: 'ICCScriptName', map: 'MAP_ICC', entries: [{ boss: 'DATA_A', shape: expect.any(Object) }] });
  });

  it('finds the creature scripts of each boss: BossAI ones and those setting the boundary themselves', () => {
    const scripts = parseBossScripts(`
      struct boss_patchwerkAI : public BossAI { explicit boss_patchwerkAI(Creature* c) : BossAI(c, BOSS_PATCHWERK) { } };
      struct boss_attumen : public BossAI { boss_attumen(Creature* creature) : BossAI(creature, DATA_ATTUMEN) { } };
      struct boss_midnight : public BossAI { boss_midnight(Creature* creature) : BossAI(creature, DATA_ATTUMEN), _phase(0) { } };
      struct boss_again : public BossAI { boss_againAI(Creature* creature) : BossAI(creature, DATA_ATTUMEN) { } boss_again(Creature* c) : BossAI(c, DATA_ATTUMEN) { } };
      struct npc_guardAI : public ScriptedAI {
        npc_guardAI(Creature* creature) : ScriptedAI(creature) { }
        void Reset() override { SetBoundary(_instance->GetBossBoundary(DATA_KARATHRESS)); SetBoundary(_instance->GetBossBoundary(DATA_KARATHRESS)); }
      };
      // SetBoundary(instance->GetBossBoundary(DATA_IN_A_COMMENT));
      void Lonely() { SetBoundary(instance->GetBossBoundary(DATA_NOBODY)); }
    `);
    expect(scripts.get('BOSS_PATCHWERK')).toEqual(['boss_patchwerk']);
    expect(scripts.get('DATA_ATTUMEN')).toEqual(['boss_attumen', 'boss_midnight', 'boss_again']);
    expect(scripts.get('DATA_KARATHRESS')).toEqual(['npc_guard']);
    expect(scripts.has('DATA_IN_A_COMMENT')).toBe(false);
    expect(parseBossScripts('void Lonely() { SetBoundary(instance->GetBossBoundary(DATA_NOBODY)); }').size).toBe(0);
  });

  it('outlines the flat shapes and describes every shape', () => {
    const parsed = parseInstanceBoundaries(INSTANCE);
    const shapes = Object.fromEntries((parsed?.entries ?? []).map((e) => [e.boss, e.shape]));
    expect(boundaryOutline(shapes['BOSS_ANUB'], 4)?.[1]).toEqual({ x: 10 + 5 * Math.cos(Math.PI / 2), y: 5 });
    expect(boundaryOutline(shapes['BOSS_SINDRA'], 4)?.[0]).toEqual({ x: 4418.6 + 110, y: 2484 });
    expect(boundaryOutline(shapes['BOSS_FAERLINA'])).toHaveLength(4);
    expect(boundaryOutline(shapes['BOSS_TRI'])).toHaveLength(3);
    expect(boundaryOutline(shapes['BOSS_THADDIUS'])).toHaveLength(4);
    expect(boundaryOutline(shapes['BOSS_RAZUVIOUS'])).toBeUndefined();
    expect(boundaryOutline(shapes['BOSS_ANUB'])).toHaveLength(64);
    expect(Object.values(shapes).map(describeBoundary)).toEqual([
      'circle r 5.0 at (10.0, 0.0)',
      'rectangle x 3315..3402, y -3727..-3590 (keeps out)',
      'circle r 56.0 at (2772.6, -3685.3)',
      'ellipse 110.0 × 75.0 at (4418.6, 2484.0)',
      'parallelogram (0.0, 0.0) (10.0, 0.0) (10.0, 5.0) (0.0, 5.0)',
      'triangle (0.0, 0.0) (1.0, 0.0) (0.0, 1.0)',
      'height 260..287',
      'intersect of rectangle x 1..2, y 3..4 and height 0.5..100',
      'union of height 1..2 and height 3..4',
    ]);
  });
});
