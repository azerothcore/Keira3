import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { AcoreString } from '@keira/shared/acore-world-model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { AcoreStringComponent } from './acore-string.component';
import { AcoreStringHandlerService } from './acore-string-handler.service';

describe('Acore String integration tests', () => {
  class Page extends EditorPageObject<AcoreStringComponent> {}

  const entry = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `acore_string` (`entry`, `content_default`) VALUES\n' +
    "(1234, '');";

  const originalEntity = new AcoreString();
  originalEntity.entry = entry;
  originalEntity.content_default = 'Hi';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, AcoreStringComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(AcoreStringHandlerService);
    handlerService['_selected'] = `${entry}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(AcoreStringComponent);
    const component = fixture.componentInstance;
    const page = new Page(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, fixture, component, page };
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
      expect(handlerService.isUnsaved()).toBe(false);
      page.setInputValueById(field, 'Hi, i am a quest');
      expect(handlerService.isUnsaved()).toBe(true);
      page.setInputValueById(field, '');
      expect(handlerService.isUnsaved()).toBe(false);
      page.removeNativeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `acore_string` (`entry`, `content_default`) VALUES\n' +
        "(1234, 'Hi');";
      querySpy.mockClear();

      page.setInputValueById('content_default', 'Hi');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
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
          'INSERT INTO `acore_string` (`entry`, `content_default`) VALUES\n' +
          "(1234, 'Hi');",
      );
      page.removeNativeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery = "UPDATE `acore_string` SET `content_default` = '0' WHERE (`entry` = 1234);";
      querySpy.mockClear();

      page.changeAllFields(originalEntity, ['entry']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('content_default', 'Hello');
      page.expectDiffQueryToContain("UPDATE `acore_string` SET `content_default` = 'Hello' WHERE (`entry` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `acore_string` WHERE (`entry` = 1234);\n' +
          'INSERT INTO `acore_string` (`entry`, `content_default`) VALUES\n' +
          "(1234, 'Hello');",
      );
      page.removeNativeElement();
    });
  });
});
