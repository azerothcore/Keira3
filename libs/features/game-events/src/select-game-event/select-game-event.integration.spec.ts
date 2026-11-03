import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GameEventHandlerService } from '../game-event-handler.service';
import { SelectGameEventComponent } from './select-game-event.component';

class SelectGameEventPage extends SelectPageObject<SelectGameEventComponent> {}

describe('SelectGameEvent integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, SelectGameEventComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameEventHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 4 }]));
    const page = new SelectGameEventPage(TestBed.createComponent(SelectGameEventComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, querySpy };
  };

  it('proposes the next event id and lists the events with what they spawn', async () => {
    const { page, querySpy } = setup();
    await page.whenStable();
    expect(page.createInput.value).toBe('5');
    expect(page.queryWrapper.innerText).toContain('ABS(`c`.`eventEntry`) = `game_event`.`eventEntry`');

    querySpy.mockReturnValue(of([{ eventEntry: 1, description: 'Midsummer', creatures: 12, gameobjects: 3 }]));
    page.setInputValue(page.searchIdInput, 1);
    page.clickElement(page.searchBtn);
    await page.whenStable();

    expect(page.getDatatableCell(0, 1).innerText).toContain('Midsummer');
    expect(page.getDatatableCell(0, 6).innerText).toContain('12');
  });
});
