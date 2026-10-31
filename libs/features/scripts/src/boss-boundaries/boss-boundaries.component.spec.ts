import { TestBed } from '@angular/core/testing';
import { BossBoundary } from '@keira/shared/wow-data';
import { click, settle, setupSourcePage, setValue } from '../scripts.testing';
import { boundaryCenter, BossBoundariesComponent } from './boss-boundaries.component';

describe('BossBoundariesComponent', () => {
  const boundaries: BossBoundary[] = [
    {
      mapId: 533,
      instance: 'instance_naxxramas',
      boss: 'BOSS_PATCHWERK',
      shapes: [
        { type: 'zrange', minZ: 1, maxZ: 9, inverted: false },
        { type: 'circle', center: { x: 10, y: 20 }, radius: 30, inverted: false },
      ],
      scriptNames: ['boss_patchwerk'],
    },
    {
      mapId: 533,
      instance: 'instance_naxxramas',
      boss: 'BOSS_HEIGHT',
      shapes: [{ type: 'zrange', minZ: 1, maxZ: 2, inverted: true }],
      scriptNames: [],
    },
  ];

  it('finds the middle of the first flat shape', () => {
    expect(boundaryCenter([{ type: 'rectangle', minX: 0, maxX: 10, minY: 0, maxY: 4, inverted: false }])).toEqual({ x: 5, y: 2 });
    const union = {
      type: 'union' as const,
      shapes: [boundaries[1].shapes[0], { type: 'rectangle', minX: 0, maxX: 2, minY: 0, maxY: 2, inverted: false }] as never,
      inverted: false,
    };
    expect(boundaryCenter([union])).toEqual({ x: 1, y: 1 });
    expect(boundaryCenter(boundaries[1].shapes)).toBeUndefined();
  });

  it('lists the boundaries, filters them and shows one in the World Editor', async () => {
    const { page, fixture, navigate } = setupSourcePage(BossBoundariesComponent, {
      getAllBossBoundaries: vi.fn().mockResolvedValue(boundaries),
    });
    expect(page.query('#reading')).toBeTruthy();
    await settle(fixture);
    expect(page.queryAll('#boundaries tbody tr').length).toBe(2);
    expect(page.query('#boundaries').textContent).toContain('circle r 30.0');
    expect(page.query('#show-BOSS_HEIGHT', false)).toBeFalsy();
    click(page, '#show-BOSS_PATCHWERK');
    const [[, { queryParams }]] = navigate.mock.calls as [unknown, { queryParams: Record<string, number> }][];
    expect(queryParams['map']).toBe(533);
    expect(queryParams['x']).toBeCloseTo(10);
    expect(queryParams['y']).toBeCloseTo(20);
    setValue(page, '#boundary-filter', 'patchwerk');
    expect(page.queryAll('#boundaries tbody tr').length).toBe(1);
  });

  it('says when the source can not be read, or is not set', async () => {
    const failing = setupSourcePage(BossBoundariesComponent, { getAllBossBoundaries: vi.fn().mockRejectedValue(new Error('locked')) });
    await settle(failing.fixture);
    expect(failing.page.query('#source-error').textContent).toContain('locked');
    TestBed.resetTestingModule();
    const unset = setupSourcePage(BossBoundariesComponent, { getAllBossBoundaries: vi.fn() }, [], { source: '' });
    expect(unset.page.query('#no-source')).toBeTruthy();
  });
});
