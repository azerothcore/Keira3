import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameEvent } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventComponent, minutesText } from './game-event.component';

class GameEventPage extends EditorPageObject<GameEventComponent> {}

describe('GameEvent integration tests', () => {
  const id = 12;
  const existing = Object.assign(new GameEvent(), { eventEntry: id, description: 'Midsummer', occurence: 525600, length: 20160 });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, GameEventComponent],
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
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [existing]));
    const page = new GameEventPage(TestBed.createComponent(GameEventComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy, handlerService };
  };

  it('writes a new event', () => {
    const { page } = setup(true);

    page.setInputValueById('description', 'Fishing Extravaganza');

    page.expectFullQueryToContain(
      'INSERT INTO `game_event` (`eventEntry`, `start_time`, `end_time`, `occurence`, `length`, `holiday`, `holidayStage`, ' +
        "`description`, `world_event`, `announce`) VALUES\n(12, '2000-01-01 18:00:00', '2000-01-01 18:00:00', 5184000, 2592000, 0, 0, " +
        "'Fishing Extravaganza', 0, 2);",
    );
  });

  it('edits an event, its times shown in days and hours', () => {
    const { page, handlerService } = setup(false);
    expect(page.query('#occurence-text').textContent).toContain('365d');
    expect(page.query('#length-text').textContent).toContain('14d');

    page.setInputValueById('length', 1500);

    page.expectDiffQueryToContain('UPDATE `game_event` SET `length` = 1500 WHERE (`eventEntry` = 12);');
    expect(page.query('#length-text').textContent).toContain('1d 1h');
    expect(handlerService.isGameEventUnsaved()).toBe(true);
  });

  it('writes minutes as days, hours and minutes', () => {
    expect(minutesText(0)).toBe('0m');
    expect(minutesText('90')).toBe('1h 30m');
    expect(minutesText(null)).toBe('0m');
    expect(minutesText(2880)).toBe('2d');
  });
});
