import { TestBed, waitForAsync } from '@angular/core/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { AcoreString } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { AcoreStringComponent } from './acore-string.component';
import { AcoreStringHandlerService } from './acore-string-handler.service';

describe('Acore String integration tests', () => {
  class Page extends EditorPageObject<AcoreStringComponent> {}

  const entry = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `acore_string` (`entry`, `content_default`, `locale_koKR`, `locale_frFR`, `locale_deDE`, ' +
    '`locale_zhCN`, `locale_zhTW`, `locale_esES`, `locale_esMX`, `locale_ruRU`)' +
    ' VALUES\n' +
    "(1234, '', '', '', '', '', '', '', '', '');";

  const originalEntity = new AcoreString();
  originalEntity.entry = entry;
  originalEntity.content_default = 'Hi';
  originalEntity.locale_koKR = '1';
  originalEntity.locale_frFR = '2';
  originalEntity.locale_deDE = '3';
  originalEntity.locale_zhCN = '4';
  originalEntity.locale_zhTW = '5';
  originalEntity.locale_esES = '6';
  originalEntity.locale_esMX = '7';
  originalEntity.locale_ruRU = '8';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), AcoreStringComponent, TranslateTestingModule],
      providers: [{ provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(AcoreStringHandlerService);
    handlerService['_selected'] = `${entry}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(AcoreStringComponent);
    const component = fixture.componentInstance;
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, fixture, component, page: page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'content_default';
      expect(handlerService.isUnsaved).toBe(false);
      page.setInputValueById(field, 'Hi, i am a quest');
      expect(handlerService.isUnsaved).toBe(true);
      page.setInputValueById(field, '');
      expect(handlerService.isUnsaved).toBe(false);
      page.removeNativeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `acore_string` (`entry`, `content_default`, `locale_koKR`, `locale_frFR`, `locale_deDE`, ' +
        '`locale_zhCN`, `locale_zhTW`, `locale_esES`, `locale_esMX`, `locale_ruRU`)' +
        ' VALUES\n' +
        "(1234, 'Hi', '', '', '', '', '', '', '', '');";
      querySpy.calls.reset();

      page.setInputValueById('content_default', 'Hi');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `acore_string` (`entry`, `content_default`, `locale_koKR`, `locale_frFR`, `locale_deDE`, ' +
          '`locale_zhCN`, `locale_zhTW`, `locale_esES`, `locale_esMX`, `locale_ruRU`)' +
          ' VALUES\n' +
          "(1234, 'Hi', '1', '2', '3', '4', '5', '6', '7', '8');",
      );
      page.removeNativeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery = "UPDATE `acore_string` SET `content_default` = '0' WHERE (`entry` = 1234);";
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['entry']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('content_default', 'Hello');
      page.expectDiffQueryToContain("UPDATE `acore_string` SET `content_default` = 'Hello' WHERE (`entry` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `acore_string` (`entry`, `content_default`, `locale_koKR`, `locale_frFR`, `locale_deDE`, ' +
          '`locale_zhCN`, `locale_zhTW`, `locale_esES`, `locale_esMX`, `locale_ruRU`)' +
          ' VALUES\n' +
          "(1234, 'Hello', '1', '2', '3', '4', '5', '6', '7', '8');",
      );

      page.setInputValueById('locale_deDE', 'Hallo');
      page.expectDiffQueryToContain(
        "UPDATE `acore_string` SET `content_default` = 'Hello', `locale_deDE` = 'Hallo' WHERE (`entry` = 1234);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `acore_string` (`entry`, `content_default`, `locale_koKR`, `locale_frFR`, `locale_deDE`, ' +
          '`locale_zhCN`, `locale_zhTW`, `locale_esES`, `locale_esMX`, `locale_ruRU`)' +
          ' VALUES\n' +
          "(1234, 'Hello', '1', '2', 'Hallo', '4', '5', '6', '7', '8');",
      );
      page.removeNativeElement();
    });
  });
});
