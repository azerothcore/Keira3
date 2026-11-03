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
import { SpellScriptsHandlerService } from '../spell-scripts-handler.service';
import { SelectSpellScriptsComponent } from './select-spell-scripts.component';

class SelectSpellScriptsPage extends SelectPageObject<SelectSpellScriptsComponent> {}

describe('SelectSpellScripts integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, SelectSpellScriptsComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        SpellScriptsHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  it('lists the scripts, one row each, with their steps and commands', async () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([{ max: 4 }]));
    const page = new SelectSpellScriptsPage(TestBed.createComponent(SelectSpellScriptsComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    await page.whenStable();
    expect(page.queryWrapper.innerText).toContain('GROUP BY id');

    querySpy.mockReturnValue(of([{ id: 7, steps: 3, commands: '10,15', gameobjects: 1 }]));
    page.clickElement(page.searchBtn);
    await page.whenStable();

    expect(page.getDatatableCell(0, 1).innerText).toContain('3');
    expect(page.getDatatableCell(0, 2).innerText).toContain('10,15');
  });
});
