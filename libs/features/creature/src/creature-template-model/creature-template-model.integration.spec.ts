import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CreatureTemplateModel } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { Model3DViewerComponent } from '@keira/shared/model-3d-viewer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { MockComponent } from 'ng-mocks';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateModelComponent } from './creature-template-model.component';

describe('CreatureTemplateModel integration tests', () => {
  class CreatureTemplateModelPage extends MultiRowEditorPageObject<CreatureTemplateModelComponent> {
    getAllModelViewers(): HTMLElement[] {
      return this.queryAll('keira-model-3d-viewer');
    }
  }

  const id = 1234;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureTemplateModelComponent, TranslateTestingModule, ReactiveFormsModule],
      declarations: [MockComponent(Model3DViewerComponent)],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow0 = new CreatureTemplateModel();
    const originalRow1 = new CreatureTemplateModel();
    const originalRow2 = new CreatureTemplateModel();
    originalRow0.CreatureID = originalRow1.CreatureID = originalRow2.CreatureID = id;
    originalRow0.Idx = 0;
    originalRow1.Idx = 1;
    originalRow2.Idx = 2;

    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const httpTestingController = TestBed.inject(HttpTestingController);
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(CreatureTemplateModelComponent);
    const component = fixture.componentInstance;
    const page = new CreatureTemplateModelPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, fixture, component, page, httpTestingController };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('Idx').disabled).toBe(true);
      expect(page.getInputById('CreatureDisplayID').disabled).toBe(true);
      expect(page.getInputById('DisplayScale').disabled).toBe(true);
      expect(page.getInputById('Probability').disabled).toBe(true);
      expect(page.getInputById('VerifiedBuild').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isCreatureTemplateModelUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureTemplateModelUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureTemplateModelUnsaved()).toBe(false);
      page.removeNativeElement();
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 1, 1, 0),\n' +
        '(1234, 1, 0, 1, 1, 0),\n' +
        '(1234, 2, 0, 1, 1, 0);';
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);
      expect(page.getAllModelViewers().length).toBe(3); // check one model viewer per row

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (0));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 1, 1, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 1, 1, 0)',
      );

      page.setInputValueById('Idx', '28');

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (28));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 28, 0, 1, 1, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 28, 0, 1, 1, 0);',
      );
      page.removeNativeElement();
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();

      page.setInputValueById('Idx', '28');

      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (28, 0));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 28, 0, 1, 1, 0),\n' +
          '(1234, 0, 0, 1, 1, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 28, 0, 1, 1, 0),\n' +
          '(1234, 0, 0, 1, 1, 0);',
      );
      page.removeNativeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 1, 1, 0),\n' +
          '(1234, 1, 0, 1, 1, 0),\n' +
          '(1234, 2, 0, 1, 1, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
      expect(page.getAllModelViewers().length).toBe(3); // check one model viewer per row
      page.removeNativeElement();
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1));');
      page.expectFullQueryToContain(
        'creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 1, 1, 0),\n' +
          '(1234, 2, 0, 1, 1, 0);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 1, 1, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_model` WHERE `CreatureID` = 1234;');
      page.expectFullQueryToBeEmpty();
      page.removeNativeElement();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);

      page.setInputValueById('CreatureDisplayID', '1111');
      page.setInputValueById('DisplayScale', '222');
      page.setInputValueById('Probability', '333');

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 1111, 222, 333, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 1, 1, 0),\n' +
          '(1234, 1, 1111, 222, 333, 0),\n' +
          '(1234, 2, 0, 1, 1, 0);',
      );
      page.removeNativeElement();
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Idx', '28');

      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234) AND (`Idx` IN (1, 2, 28, 3));\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 28, 0, 1, 1, 0),\n' +
          '(1234, 3, 0, 1, 1, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_model` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_model` (`CreatureID`, `Idx`, `CreatureDisplayID`, `DisplayScale`, `Probability`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 1, 1, 0),\n' +
          '(1234, 28, 0, 1, 1, 0),\n' +
          '(1234, 3, 0, 1, 1, 0);',
      );
      page.removeNativeElement();
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('Idx', 0);

      page.expectUniqueError();
      page.removeNativeElement();
    });
  });
});
