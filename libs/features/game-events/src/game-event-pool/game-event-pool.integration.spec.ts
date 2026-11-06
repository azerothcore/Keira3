import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameEventPool } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventSpawnedPoolsComponent } from './game-event-pool.component';

class GameEventSpawnedPoolsPage extends MultiRowEditorPageObject<GameEventSpawnedPoolsComponent> {}

describe('GameEventPool integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, GameEventSpawnedPoolsComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameEventHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = (creatingNew: boolean) => {
    const handlerService = TestBed.inject(GameEventHandlerService);
    handlerService['_selected'] = '12';
    handlerService.isNew = creatingNew;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    const existing = Object.assign(new GameEventPool(), { eventEntry: 12, pool_entry: 7 });
    const selectAll = vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [existing]));
    const page = new GameEventSpawnedPoolsPage(TestBed.createComponent(GameEventSpawnedPoolsComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, selectAll, handlerService };
  };

  it('reads the rows of the event', () => {
    const { page, selectAll } = setup(false);

    expect(selectAll).toHaveBeenCalledWith('game_event_pool', 'eventEntry', '12');
    expect(page.getEditorTableRowsCount()).toBe(1);
    expect(page.query('#game-event-help')).toBeTruthy();
  });

  it('adds rows to the event, then executes the query', () => {
    const { page, querySpy, handlerService } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isGameEventPoolUnsaved()).toBe(true);
    page.setInputValueById('pool-entry', 55);

    const expected =
      'DELETE FROM `game_event_pool` WHERE (`eventEntry` = 12) AND (`pool_entry` IN (55));\n' +
      'INSERT INTO `game_event_pool` (`eventEntry`, `pool_entry`) VALUES\n' +
      '(12, 55);';
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });
});
