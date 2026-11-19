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
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { SelectAreaTriggerComponent } from './select-area-trigger.component';

class SelectAreaTriggerPage extends SelectPageObject<SelectAreaTriggerComponent> {}

describe('SelectAreaTrigger integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, SelectAreaTriggerComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        AreaTriggerHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  it('lists the teleports with their script and quest, a dash when none', async () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 4 }]));
    const page = new SelectAreaTriggerPage(TestBed.createComponent(SelectAreaTriggerComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    await page.whenStable();
    expect(page.queryWrapper.innerText).toContain('`areatrigger_scripts`');

    querySpy.mockReturnValue(
      of([
        { ID: 45, Name: 'Scarlet Monastery', target_map: 189, script: 'at_sm', quest: null },
        { ID: 46, Name: 'Other', target_map: 0, script: null, quest: 12 },
      ]),
    );
    page.clickElement(page.searchBtn);
    await page.whenStable();

    expect(page.getDatatableCell(0, 3).innerText).toContain('at_sm');
    expect(page.getDatatableCell(0, 4).innerText).toContain('-');
    expect(page.getDatatableCell(1, 3).innerText).toContain('-');
    expect(page.getDatatableCell(1, 4).innerText).toContain('12');
  });
});
