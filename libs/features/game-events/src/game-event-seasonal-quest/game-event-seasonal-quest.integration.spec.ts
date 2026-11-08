import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameEventSeasonalQuest } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventSeasonalQuestComponent } from './game-event-seasonal-quest.component';

class GameEventSeasonalQuestPage extends MultiRowEditorPageObject<GameEventSeasonalQuestComponent> {}

describe('GameEventSeasonalQuest integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, GameEventSeasonalQuestComponent],
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
    const existing = Object.assign(new GameEventSeasonalQuest(), { eventEntry: 12, questId: 7 });
    const selectAll = vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [existing]));
    const page = new GameEventSeasonalQuestPage(TestBed.createComponent(GameEventSeasonalQuestComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, selectAll, handlerService };
  };

  it('reads the rows of the event', () => {
    const { page, selectAll } = setup(false);

    expect(selectAll).toHaveBeenCalledWith('game_event_seasonal_questrelation', 'eventEntry', '12');
    expect(page.getEditorTableRowsCount()).toBe(1);
    expect(page.query('#game-event-help')).toBeTruthy();
  });

  it('adds rows to the event, then executes the query', () => {
    const { page, querySpy, handlerService } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isGameEventSeasonalQuestUnsaved()).toBe(true);
    page.setInputValueById('quest-id', 55);

    const expected =
      'DELETE FROM `game_event_seasonal_questrelation` WHERE (`eventEntry` = 12) AND (`questId` IN (55));\n' +
      'INSERT INTO `game_event_seasonal_questrelation` (`eventEntry`, `questId`) VALUES\n' +
      '(12, 55);';
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });
});
