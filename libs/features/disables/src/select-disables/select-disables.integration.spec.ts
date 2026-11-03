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
import { DisablesHandlerService } from '../disables-handler.service';
import { SelectDisablesComponent } from './select-disables.component';

class SelectDisablesPage extends SelectPageObject<SelectDisablesComponent> {}

describe('SelectDisables integration tests', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, TranslateTestingModule, SelectDisablesComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        DisablesHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([]));
    const page = new SelectDisablesPage(TestBed.createComponent(SelectDisablesComponent));
    page.fixture.autoDetectChanges(true);
    page.fixture.detectChanges();
    return { page, navigate, querySpy };
  };

  it('opens the disables of a source type', () => {
    const { page, navigate } = setup();

    page.clickElement(page.query<HTMLButtonElement>('#source-type-2'));

    const handler = TestBed.inject(DisablesHandlerService);
    expect(handler.selected).toBe('2');
    expect(handler.selectedName).toBe('MAP');
    expect(navigate).toHaveBeenCalledWith(['disables/disables']);
  });

  it('finds disables by entry, naming their source type', async () => {
    const { page, querySpy } = setup();
    querySpy.mockReturnValue(
      of([
        { sourceType: 0, entry: 133, flags: 1, params_0: '', params_1: '', comment: 'Fireball' },
        { sourceType: 99, entry: 1, flags: 0, params_0: '', params_1: '', comment: '' },
      ]),
    );

    page.setInputValue(page.query<HTMLInputElement>('#search-entry'), 133);
    page.clickElement(page.searchBtn);
    await page.whenStable();

    expect(querySpy.mock.calls.at(-1)?.[0]).toContain("`entry` LIKE '%133%'");
    expect(page.getDatatableCell(0, 0).innerText).toContain('0 - SPELL');
    expect(page.getDatatableCell(1, 0).innerText).toContain('99 - 99');
  });
});
