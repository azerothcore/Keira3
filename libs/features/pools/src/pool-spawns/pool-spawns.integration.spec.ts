import { PoolCreature, PoolGameobject } from '@keira/shared/acore-world-model';
import { configurePoolTest, problemIds, setupPoolEditor } from '../pool.testing';
import { PoolCreatureComponent, PoolGameobjectComponent } from './pool-spawns.component';

describe('Pool spawns integration tests', () => {
  const member = (guid: number, chance = 0) => Object.assign(new PoolCreature(), { pool_entry: 50, guid, chance });
  const spawn = (guid: number, map: number, objectType = -1) => ({
    id: guid,
    entry: 300 + guid,
    name: `Spawn ${guid}`,
    map,
    x: '1',
    y: '2',
    z: '3',
    objectType,
  });

  describe('creatures', () => {
    beforeEach(() => configurePoolTest(PoolCreatureComponent));

    it('names the spawns, shows them in the World Editor and checks the pool', () => {
      const { page, navigate, querySpy } = setupPoolEditor(
        PoolCreatureComponent,
        50,
        [member(1, 60), member(2, 30), member(3)],
        [
          [/FROM pool_template/, [{ max_limit: 1 }]],
          [/FROM pool_pool/, []],
          [/FROM creature s/, [spawn(1, 0), spawn(2, 1)]],
          [/FROM pool_creature WHERE guid IN/, [{ id: 2, pool_entry: 9 }]],
        ],
      );
      expect(querySpy.mock.calls.find(([sql]) => /FROM creature s/.test(sql))?.[0]).toContain('s.guid IN (1, 2, 3)');
      expect(page.getDatatableCell(0, 3).innerText).toBe('Spawn 1');
      expect(page.getDatatableCell(2, 3).innerText).toContain('POOLS.NO_SPAWN');
      // 60 + 30 with one at 0: fine; guid 3 missing, two maps, guid 2 in pool 9
      expect(problemIds(page)).toEqual(['MISSING_SPAWN', 'MANY_MAPS', 'OTHER_POOL']);
      page.clickElement(page.query('#show-1'));
      expect(navigate).toHaveBeenCalledWith(['world-editor'], {
        queryParams: { map: 0, x: 1, y: 2, z: 3, select: 'creature:1' },
      });
      // a new member reads its spawn
      page.addNewRow();
      page.setInputValueById('guid', 4);
      expect(querySpy.mock.calls.some(([sql]) => /s\.guid IN \(4\)/.test(sql))).toBe(true);
      page.setInputValueById('chance', 150);
      expect(problemIds(page)).toContain('CHANCE_RANGE');
      page.expectDiffQueryToContain('INSERT INTO `pool_creature`');
    });

    it('says when the pool is not in pool_template, and stays quiet when nothing can be read', () => {
      const { page } = setupPoolEditor(
        PoolCreatureComponent,
        50,
        [member(1, 50)],
        [
          [/FROM pool_template/, []],
          [/./, new Error('down')],
        ],
      );
      expect(problemIds(page)).toEqual(['NO_TEMPLATE']);
    });

    it('checks nothing while the pool can not be read', () => {
      const { page } = setupPoolEditor(PoolCreatureComponent, 50, [member(1, 50)], [[/./, new Error('down')]]);
      expect(problemIds(page)).toEqual([]);
    });
  });

  describe('gameobjects', () => {
    beforeEach(() => configurePoolTest(PoolGameobjectComponent));

    it('only pools chests, goobers and fishing holes', () => {
      const rows = [1, 2].map((guid) => Object.assign(new PoolGameobject(), { pool_entry: 50, guid, chance: 50 }));
      const { page, querySpy } = setupPoolEditor(PoolGameobjectComponent, 50, rows, [
        [/FROM pool_template/, [{ max_limit: 2 }]],
        [/FROM gameobject s/, [spawn(1, 0, 3), spawn(2, 0, 5)]],
      ]);
      expect(querySpy.mock.calls.find(([sql]) => /FROM gameobject s/.test(sql))?.[0]).toContain('IFNULL(t.type, -1)');
      expect(problemIds(page)).toEqual(['CHANCE_IGNORED', 'NOT_POOLABLE']);
    });
  });
});
