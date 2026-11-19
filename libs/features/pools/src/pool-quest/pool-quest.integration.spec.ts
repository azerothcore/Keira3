import { PoolQuest } from '@keira/shared/acore-world-model';
import { configurePoolTest, problemIds, setupPoolEditor } from '../pool.testing';
import { PoolQuestComponent, QUEST_FLAG_DAILY, QUEST_FLAG_WEEKLY } from './pool-quest.component';

describe('PoolQuest integration tests', () => {
  const quest = (entry: number) => Object.assign(new PoolQuest(), { pool_entry: 50, entry });
  beforeEach(() => configurePoolTest(PoolQuestComponent));

  it('names the quests and checks they can be pooled', () => {
    const { page } = setupPoolEditor(
      PoolQuestComponent,
      50,
      [quest(1), quest(2), quest(3), quest(4)],
      [
        [/FROM pool_template/, [{ max_limit: 1 }]],
        [/FROM pool_pool/, [{ mother_pool: 8 }]],
        [
          /FROM quest_template/,
          [
            { id: 1, name: 'Daily', Flags: QUEST_FLAG_DAILY },
            { id: 2, name: 'Weekly', Flags: QUEST_FLAG_WEEKLY },
            { id: 3, name: 'Once', Flags: 0 },
          ],
        ],
        [/FROM pool_quest WHERE entry IN/, [{ id: 1, pool_entry: 9 }]],
      ],
    );
    expect(page.getDatatableCell(0, 2).innerText).toBe('Daily');
    expect(page.getDatatableCell(3, 2).innerText).toBe('');
    expect(problemIds(page)).toEqual(['QUEST_IN_MOTHER', 'MISSING_QUEST', 'QUEST_NOT_REPEATING', 'QUEST_MIXED', 'OTHER_POOL']);
  });

  it('is fine with dailies only', () => {
    const { page } = setupPoolEditor(
      PoolQuestComponent,
      50,
      [quest(1)],
      [
        [/FROM pool_template/, [{ max_limit: 1 }]],
        [/FROM quest_template/, [{ id: 1, name: 'Daily', Flags: QUEST_FLAG_DAILY }]],
      ],
    );
    expect(problemIds(page)).toEqual([]);
  });
});
