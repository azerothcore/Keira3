import { GameEventPool } from '@keira/shared/acore-world-model';
import { configurePoolTest, problemIds, setupPoolEditor } from '../pool.testing';
import { GameEventPoolComponent } from './game-event-pool.component';

describe('GameEventPool integration tests', () => {
  const event = (eventEntry: number) => Object.assign(new GameEventPool(), { pool_entry: 50, eventEntry });
  beforeEach(() => configurePoolTest(GameEventPoolComponent));

  it('names the events and wants one per pool', () => {
    const { page, querySpy } = setupPoolEditor(
      GameEventPoolComponent,
      50,
      [event(-12), event(99)],
      [
        [/FROM pool_template/, [{ max_limit: 1 }]],
        [/FROM game_event/, [{ id: 12, description: 'Fishing Extravaganza' }]],
      ],
    );
    expect(querySpy.mock.calls.find(([sql]) => /FROM game_event/.test(sql))?.[0]).toContain('IN (12, 99)');
    expect(page.getDatatableCell(0, 2).innerText).toContain('Fishing Extravaganza');
    expect(page.getDatatableCell(0, 2).innerText).toContain('POOLS.REMOVED_DURING');
    expect(problemIds(page)).toEqual(['ONE_EVENT', 'MISSING_EVENT']);
  });

  it('is fine with one event that exists', () => {
    const { page } = setupPoolEditor(
      GameEventPoolComponent,
      50,
      [event(12)],
      [
        [/FROM pool_template/, [{ max_limit: 1 }]],
        [/FROM game_event/, [{ id: 12, description: 'Fishing' }]],
      ],
    );
    expect(problemIds(page)).toEqual([]);
  });
});
