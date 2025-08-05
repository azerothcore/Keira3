import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CreatureTemplateResistance } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateResistanceComponent } from './creature-template-resistance.component';

describe('CreatureTemplateResistance integration tests', () => {
  class CreatureTemplateResistancePage extends MultiRowEditorPageObject<CreatureTemplateResistanceComponent> {}

  const id = 1234;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureTemplateResistanceComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const originalRow0 = new CreatureTemplateResistance();
    const originalRow1 = new CreatureTemplateResistance();
    const originalRow2 = new CreatureTemplateResistance();
    originalRow0.CreatureID = originalRow1.CreatureID = originalRow2.CreatureID = id;
    originalRow0.School = 1;
    originalRow1.School = 2;
    originalRow2.School = 3;

    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(CreatureTemplateResistanceComponent);
    const component = fixture.componentInstance;
    const page = new CreatureTemplateResistancePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, fixture, component, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getDebugElementByCss<HTMLSelectElement>('#School select').nativeElement.disabled).toBe(true);
      expect(page.getInputById('Resistance').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isCreatureTemplateResistanceUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureTemplateResistanceUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureTemplateResistanceUnsaved()).toBe(false);
      page.removeNativeElement();
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (1, 2, 3));\n' +
        'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 0),\n' +
        '(1234, 2, 0, 0),\n' +
        '(1234, 3, 0, 0);';
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (1));\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0);',
      );

      const select = page.getDebugElementByCss<HTMLSelectElement>('#School select').nativeElement;
      page.setInputValue(select, '1: 2');

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (2));\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 2, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 2, 0, 0);',
      );
      page.removeNativeElement();
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();

      const select = page.getDebugElementByCss<HTMLSelectElement>('#School select').nativeElement;
      page.setInputValue(select, '1: 2');

      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (2, 1));\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 2, 0, 0),\n' +
          '(1234, 1, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 2, 0, 0),\n' +
          '(1234, 1, 0, 0);',
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
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0),\n' +
          '(1234, 2, 0, 0),\n' +
          '(1234, 3, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.removeNativeElement();
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0),\n' +
          '(1234, 3, 0, 0);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (2, 3));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_resistance` WHERE `CreatureID` = 1234;');
      page.expectFullQueryToBeEmpty();
      page.removeNativeElement();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);

      page.setInputValueById('Resistance', '1');

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (2));\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 2, 1, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0),\n' +
          '(1234, 2, 1, 0),\n' +
          '(1234, 3, 0, 0);',
      );
      page.removeNativeElement();
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      const select = page.getDebugElementByCss<HTMLSelectElement>('#School select').nativeElement;
      page.setInputValue(select, '4: 5');

      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (2, 3, 5, 4));\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 5, 0, 0),\n' +
          '(1234, 4, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0),\n' +
          '(1234, 5, 0, 0),\n' +
          '(1234, 4, 0, 0);',
      );
      page.removeNativeElement();
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      const select = page.getDebugElementByCss<HTMLSelectElement>('#School select').nativeElement;
      page.setInputValue(select, '1: 2');

      page.expectUniqueError();
      page.removeNativeElement();
    });
  });
});
