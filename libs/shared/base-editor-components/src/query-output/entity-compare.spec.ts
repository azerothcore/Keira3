import { compareEntities } from './entity-compare';

describe('compareEntities', () => {
  it("lists the values differing, leaving out each one's own id", () => {
    const result = compareEntities(
      { table: 'creature_template', id: '1', rows: [{ entry: 1, name: 'A', minlevel: 5, subname: null }] },
      { table: 'creature_template', id: '2', rows: [{ entry: 2, name: 'B', minlevel: 5, subname: '', IconName: null }] },
    );
    expect(result).toEqual({ differences: [{ row: '', field: 'name', pinned: 'A', current: 'B' }], onlyPinned: [], onlyCurrent: [] });
  });

  it('matches the rows by both keys when the editor has two (creature_text: GroupID and ID)', () => {
    const rows = (id: number, text: string) => [0, 1].map((ID) => ({ CreatureID: id, GroupID: 0, ID, Text: ID ? text : 'same' }));
    const result = compareEntities(
      { table: 'creature_text', id: '1', key: 'GroupID', extraKey: 'ID', rows: rows(1, 'A') },
      { table: 'creature_text', id: '2', key: 'GroupID', extraKey: 'ID', rows: rows(2, 'B') },
    );
    expect(result.differences).toEqual([{ row: '0_1', field: 'Text', pinned: 'A', current: 'B' }]);
  });

  it('matches the rows of multi-row editors by their key', () => {
    const result = compareEntities(
      {
        table: 'npc_vendor',
        id: '1',
        key: 'item',
        rows: [
          { entry: 1, item: 10, maxcount: 0 },
          { entry: 1, item: 11, maxcount: 0 },
        ],
      },
      {
        table: 'npc_vendor',
        id: '2',
        key: 'item',
        rows: [
          { entry: 2, item: 10, maxcount: 5 },
          { entry: 2, item: 12, maxcount: 0 },
        ],
      },
    );
    expect(result).toEqual({
      differences: [{ row: '10', field: 'maxcount', pinned: 0, current: 5 }],
      onlyPinned: ['11'],
      onlyCurrent: ['12'],
    });
  });
});
