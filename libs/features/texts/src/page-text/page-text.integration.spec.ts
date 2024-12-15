import { TestBed, waitForAsync } from '@angular/core/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { PageText } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { PageTextComponent } from './page-text.component';
import { PageTextHandlerService } from './page-text-handler.service';

describe('PageText integration tests', () => {
  class Page extends EditorPageObject<PageTextComponent> {}

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `page_text` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `page_text` (`ID`, `Text`, `NextPageID`, `VerifiedBuild`) VALUES\n' +
    "(1234, '', 0, 0);";

  const originalEntity = new PageText();
  originalEntity.ID = id;
  originalEntity.Text = '2';
  originalEntity.NextPageID = 3;
  originalEntity.VerifiedBuild = 4;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), PageTextComponent, TranslateTestingModule],
      providers: [{ provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(PageTextHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(PageTextComponent);
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
      const field = 'NextPageID';
      expect(handlerService.isUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isUnsaved).toBe(false);
      page.removeNativeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `page_text` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `page_text` (`ID`, `Text`, `NextPageID`, `VerifiedBuild`) VALUES\n' +
        "(1234, 'Shin', 0, 0);";
      querySpy.calls.reset();

      page.setInputValueById('Text', 'Shin');
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
        'DELETE FROM `page_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `page_text` (`ID`, `Text`, `NextPageID`, `VerifiedBuild`) VALUES\n' +
          "(1234, '2', 3, 4);",
      );
      page.removeNativeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery = "UPDATE `page_text` SET `Text` = '0', `NextPageID` = 1 WHERE (`ID` = 1234);";
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('Text', 'Shin');
      page.expectDiffQueryToContain("UPDATE `page_text` SET `Text` = 'Shin' WHERE (`ID` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `page_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `page_text` (`ID`, `Text`, `NextPageID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'Shin', 3, 4);",
      );

      page.setInputValueById('NextPageID', '22');
      page.expectDiffQueryToContain("UPDATE `page_text` SET `Text` = 'Shin', `NextPageID` = 22 WHERE (`ID` = 1234);");
      page.expectFullQueryToContain(
        'DELETE FROM `page_text` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `page_text` (`ID`, `Text`, `NextPageID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 'Shin', 22, 4);",
      );
      page.removeNativeElement();
    });
  });
});
