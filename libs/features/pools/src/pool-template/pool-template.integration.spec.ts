import { PoolTemplate } from '@keira/shared/acore-world-model';
import { configurePoolTest, problemIds, setupPoolEditor } from '../pool.testing';
import { PoolTemplateComponent } from './pool-template.component';

describe('PoolTemplate integration tests', () => {
  const pool = Object.assign(new PoolTemplate(), { entry: 50, max_limit: 1, description: 'Copper veins' });
  beforeEach(() => configurePoolTest(PoolTemplateComponent));

  it('edits the pool and sums up what it holds', async () => {
    const summary = { creatures: 0, gameobjects: '3', pools: 2, quests: 1, mother: 40, event: '12' };
    const place = { type: 'gameobject', guid: 9, map: 0, x: '1', y: '2', z: '3' };
    const { page, navigate, navigateByUrl, handlerService } = setupPoolEditor(
      PoolTemplateComponent,
      50,
      [pool],
      [
        [/COUNT\(\*\)/, [summary]],
        [/UNION ALL/, [place]],
      ],
    );
    page.setInputValueById('max_limit', 2);
    page.expectDiffQueryToContain('UPDATE `pool_template` SET `max_limit` = 2 WHERE (`entry` = 50);');
    expect(page.query('#count-gameobjects').textContent).toBe('3');
    expect(page.query('#event').textContent).toBe('12');
    expect(problemIds(page)).toEqual(['MIXED', 'QUEST_IN_MOTHER']);
    page.clickElement(page.query('#show-in-3d'));
    expect(navigate).toHaveBeenCalledWith(['world-editor'], {
      queryParams: { map: 0, x: 1, y: 2, z: 3, select: 'gameobject:9' },
    });
    page.clickElement(page.query('#open-mother'));
    expect(handlerService.selected).toBe('40');
    expect(navigateByUrl).toHaveBeenCalled();
    await Promise.resolve();
  });

  it('says an empty pool will not spawn (not while new), and knows no mother or event', () => {
    const empty = { creatures: 0, gameobjects: 0, pools: 0, quests: 0, mother: null, event: undefined };
    const { page } = setupPoolEditor(PoolTemplateComponent, 50, [pool], [[/COUNT/, [empty]]]);
    expect(problemIds(page)).toEqual(['EMPTY']);
    expect(page.query('#no-mother')).toBeTruthy();
    expect(page.query('#event').textContent).toContain('POOLS.NONE');
    expect(page.query('#show-in-3d', false)).toBeFalsy();
  });

  it('shows nothing it can not read', () => {
    const { page } = setupPoolEditor(PoolTemplateComponent, 50, [], [[/./, new Error('down')]], true);
    expect(page.query('#count-creatures', false)).toBeFalsy();
    expect(problemIds(page)).toEqual([]);
  });

  it('shows nothing for a pool without rows', () => {
    const { page } = setupPoolEditor(PoolTemplateComponent, 50, [pool], [[/./, []]]);
    expect(page.query('#count-creatures', false)).toBeFalsy();
  });

  it('is fine with a new pool holding nothing', () => {
    const empty = { creatures: 0, gameobjects: 0, pools: 0, quests: 0, mother: null, event: null };
    const { page } = setupPoolEditor(PoolTemplateComponent, 50, [], [[/COUNT/, [empty]]], true);
    expect(problemIds(page)).toEqual([]);
  });
});
