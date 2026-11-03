import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameEventGameobject } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventGameobjectRemovedComponent } from './game-event-gameobject-removed.component';

class GameEventGameobjectRemovedPage extends MultiRowEditorPageObject<GameEventGameobjectRemovedComponent> {}

describe('GameEventGameobjectRemoved integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, GameEventGameobjectRemovedComponent],
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
    const existing = Object.assign(new GameEventGameobject(), { eventEntry: -12, guid: 7 });
    const selectAll = vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [existing]));
    const page = new GameEventGameobjectRemovedPage(TestBed.createComponent(GameEventGameobjectRemovedComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, selectAll, handlerService };
  };

  it('reads the rows of the event removing them', () => {
    const { page, selectAll } = setup(false);

    expect(selectAll).toHaveBeenCalledWith('game_event_gameobject', 'eventEntry', -12);
    expect(page.getEditorTableRowsCount()).toBe(1);
    expect(page.query('#game-event-help')).toBeTruthy();
  });

  it('adds rows to the event, then executes the query', () => {
    const { page, querySpy, handlerService } = setup(true);
    querySpy.mockClear();

    page.addNewRow();
    expect(handlerService.isGameEventGameobjectUnsaved()).toBe(true);
    page.setInputValueById('guid', 55);

    const expected =
      'DELETE FROM `game_event_gameobject` WHERE (`eventEntry` = -12) AND (`guid` IN (55));\n' +
      'INSERT INTO `game_event_gameobject` (`eventEntry`, `guid`) VALUES\n' +
      '(-12, 55);';
    page.expectDiffQueryToContain(expected);
    page.clickExecuteQuery();
    expect(querySpy.mock.calls.at(-1)?.[0]).toContain(expected);
  });
});
