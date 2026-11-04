import { TestBed } from '@angular/core/testing';
import { SpawnRecord } from '../world-editor.model';
import { COMPOSITIONS_KEY, compositionFrom, CompositionsService } from './compositions';

const spawn = (type: SpawnRecord['type'], guid: number, x: number, z: number, extra: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type,
  guid,
  entry: guid * 10,
  name: `S${guid}`,
  map: 0,
  x,
  y: 10,
  z,
  o: 1,
  pathId: 7,
  ...extra,
});

describe('compositions', () => {
  afterEach(() => localStorage.removeItem(COMPOSITIONS_KEY));

  it('keeps spawns around their centre, at the height of the lowest, without their paths or scripts', () => {
    const composition = compositionFrom('Camp', [
      spawn('creature', 1, 0, 5, { saiPaths: [3], pathFromTemplate: true, event: 2, wanderDistance: 4 } as Partial<SpawnRecord>),
      spawn('gameobject', 2, 10, 4.5, { rotation: [0, 0.1, 0, 1] }),
    ], 'c1');
    expect(composition.id).toBe('c1');
    expect(composition.members.map((member) => member.offset)).toEqual([
      { x: -5, y: 0, z: 0.5 },
      { x: 5, y: 0, z: 0 },
    ]);
    expect(composition.members[0].spawn).toEqual(expect.objectContaining({ pathId: 0, wanderDistance: 4 }));
    expect(composition.members[0].spawn).not.toHaveProperty('saiPaths');
    expect(composition.members[0].spawn).not.toHaveProperty('event');
    expect(composition.members[1].spawn.rotation).toEqual([0, 0.1, 0, 1]);
    expect(compositionFrom('X', [spawn('creature', 3, 0, 0)]).id).toMatch(/^\d+$/);
  });

  it('are kept on this computer, one of the same name replaced', () => {
    localStorage.setItem(COMPOSITIONS_KEY, JSON.stringify([{ id: 'old', name: 'B', members: [] }, { odd: true }]));
    const service = TestBed.inject(CompositionsService);
    expect(service.compositions().map((c) => c.id)).toEqual(['old']);
    service.save({ id: 'a', name: 'A', members: [] });
    service.save({ id: 'b2', name: 'B', members: [] });
    expect(service.compositions().map((c) => c.id)).toEqual(['a', 'b2']);
    service.remove('a');
    expect(JSON.parse(localStorage.getItem(COMPOSITIONS_KEY) as string)).toEqual([{ id: 'b2', name: 'B', members: [] }]);

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    service.remove('b2');
    expect(service.compositions()).toEqual([]);
    setItem.mockRestore();
    for (const stored of ['{', '{"a":1}']) {
      localStorage.setItem(COMPOSITIONS_KEY, stored);
      TestBed.resetTestingModule();
      expect(TestBed.inject(CompositionsService).compositions()).toEqual([]);
    }
  });
});
