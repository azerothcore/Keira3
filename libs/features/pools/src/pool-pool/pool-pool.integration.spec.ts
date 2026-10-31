import { PoolPool } from '@keira/shared/acore-world-model';
import { configurePoolTest, problemIds, setupPoolEditor } from '../pool.testing';
import { PoolPoolComponent } from './pool-pool.component';

describe('PoolPool integration tests', () => {
  const child = (pool_id: number, chance = 0) => Object.assign(new PoolPool(), { mother_pool: 50, pool_id, chance });
  beforeEach(() => configurePoolTest(PoolPoolComponent));

  it('names the child pools, opens them and checks the mother pool', async () => {
    const { page, navigate, navigateByUrl, handlerService } = setupPoolEditor(
      PoolPoolComponent,
      50,
      [child(60, 70), child(61, 20), child(40)],
      [
        [/FROM pool_template WHERE entry = /, [{ max_limit: 1 }]],
        [/SELECT mother_pool FROM pool_pool WHERE pool_id = 50/, [{ mother_pool: 40 }]],
        [
          /FROM pool_template WHERE entry IN/,
          [
            { id: 60, max_limit: 1, description: 'Copper' },
            { id: 40, description: 'Mother' },
          ],
        ],
        [/FROM pool_pool WHERE pool_id IN/, [{ id: 60, mother_pool: 7 }]],
      ],
    );
    expect(page.getDatatableCell(0, 2).innerText).toBe('Copper');
    expect(page.getDatatableCell(1, 2).innerText).toBe('');
    expect(problemIds(page)).toEqual(['POOL_LOOP', 'CHILD_NO_TEMPLATE', 'OTHER_MOTHER']);
    page.clickElement(page.query('#open-60'));
    expect(handlerService.selected).toBe('60');
    expect(navigateByUrl).toHaveBeenCalledWith('/', { skipLocationChange: true });
    await Promise.resolve();
    expect(navigate).toHaveBeenCalledWith(['pools/pool-template']);
  });

  it('knows no mother pool when it can not be read', () => {
    const { page } = setupPoolEditor(
      PoolPoolComponent,
      50,
      [child(50)],
      [
        [/FROM pool_template WHERE entry = /, [{ max_limit: 0 }]],
        [/./, new Error('down')],
      ],
    );
    expect(problemIds(page)).toEqual(['POOL_LOOP']);
  });

  it('is fine with child pools that exist', () => {
    const { page } = setupPoolEditor(
      PoolPoolComponent,
      50,
      [child(60)],
      [
        [/FROM pool_template WHERE entry = /, [{ max_limit: 0 }]],
        [/FROM pool_template WHERE entry IN/, [{ id: 60, description: 'Copper' }]],
      ],
    );
    expect(problemIds(page)).toEqual([]);
  });
});
