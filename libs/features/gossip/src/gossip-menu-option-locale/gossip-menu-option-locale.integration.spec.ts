import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GossipMenuOptionLocale } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionLocaleComponent } from './gossip-menu-option-locale.component';

class GossipMenuOptionLocalePage extends MultiRowEditorPageObject<GossipMenuOptionLocaleComponent> {}

describe('GossipMenuOptionLocale integration tests', () => {
  const id = 1234;
  const columns = '`MenuID`, `OptionID`, `Locale`, `OptionText`, `BoxText`';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, GossipMenuOptionLocaleComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GossipHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow = new GossipMenuOptionLocale();
    originalRow.MenuID = id;
    originalRow.Locale = 'deDE';

    const handlerService = TestBed.inject(GossipHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());
    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow]));

    const fixture = TestBed.createComponent(GossipMenuOptionLocaleComponent);
    const page = new GossipMenuOptionLocalePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, querySpy, page };
  }

  it('tells the handler a locale is unsaved', () => {
    const { page, handlerService } = setup(true);

    expect(handlerService.isGossipMenuOptionLocaleUnsaved()).toBe(false);
    page.addNewRow();
    expect(handlerService.isGossipMenuOptionLocaleUnsaved()).toBe(true);
    page.deleteRow();
    expect(handlerService.isGossipMenuOptionLocaleUnsaved()).toBe(false);
  });

  it('keeps one row per locale of the same OptionID', () => {
    const { page } = setup(true);
    const locale = () => page.getDebugElementByCss<HTMLSelectElement>('#locale select').nativeElement;

    page.addNewRow();
    page.setInputValueById('locale-option-i-d', 0);
    page.setInputValue(locale(), '0: deDE');
    page.addNewRow();
    page.setInputValueById('locale-option-i-d', 0);
    page.setInputValue(locale(), '1: esES');

    expect(page.formError.hidden).toBe(true);
    page.expectDiffQueryToContain(
      'DELETE FROM `gossip_menu_option_locale` WHERE (`MenuID` = 1234) AND (`OptionID` IN (0));\n' +
        `INSERT INTO \`gossip_menu_option_locale\` (${columns}) VALUES\n` +
        "(1234, 0, 'deDE'" +
        ", '', ''),\n" +
        "(1234, 0, 'esES'" +
        ", '', '');",
    );

    page.setInputValue(locale(), '0: deDE');
    expect(page.formError.hidden).toBe(false);
  });

  it('reads the existing locales', () => {
    const { page } = setup(false);

    expect(page.getEditorTableRowsCount()).toBe(1);
  });
});
