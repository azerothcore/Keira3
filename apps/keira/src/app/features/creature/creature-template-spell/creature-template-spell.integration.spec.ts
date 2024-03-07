import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedSqliteService, MysqlQueryService, SqliteService } from '@keira/shared/core';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { CreatureTemplateSpell } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateSpellComponent } from './creature-template-spell.component';
import { instance } from 'ts-mockito';

class CreatureTemplateSpellPage extends MultiRowEditorPageObject<CreatureTemplateSpellComponent> {}

describe('CreatureTemplateSpell integration tests', () => {
  const id = 1234;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        RouterTestingModule,
        CreatureTemplateSpellComponent,
        TranslateTestingModule,
      ],
      providers: [{ provide: SqliteService, useValue: instance(MockedSqliteService) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const originalRow0 = new CreatureTemplateSpell();
    const originalRow1 = new CreatureTemplateSpell();
    const originalRow2 = new CreatureTemplateSpell();
    originalRow0.CreatureID = originalRow1.CreatureID = originalRow2.CreatureID = id;
    originalRow0.Index = 0;
    originalRow1.Index = 1;
    originalRow2.Index = 2;

    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(CreatureTemplateSpellComponent);
    const component = fixture.componentInstance;
    const page = new CreatureTemplateSpellPage(fixture);
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
      expect(page.getInputById('Index').disabled).toBe(true);
      expect(page.getInputById('Spell').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.removeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isCreatureTemplateSpellUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureTemplateSpellUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureTemplateSpellUnsaved).toBe(false);
      page.removeElement();
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234) AND (`Index` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
        '(1234, 0, 0, 0),\n' +
        '(1234, 1, 0, 0),\n' +
        '(1234, 2, 0, 0);';
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
      page.removeElement();
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234) AND (`Index` IN (0));\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0);',
      );

      page.setInputValueById('Index', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234) AND (`Index` IN (1));\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 0, 0);',
      );
      page.removeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 1, 0, 0),\n' +
          '(1234, 2, 0, 0);',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.removeElement();
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234) AND (`Index` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 2, 0, 0);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234) AND (`Index` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_template_spell` WHERE `CreatureID` = 1234;');
      page.expectFullQueryToBeEmpty();
      page.removeElement();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('Index', 111);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234) AND (`Index` IN (1, 111));\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 111, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 111, 0, 0),\n' +
          '(1234, 2, 0, 0);',
      );
      page.removeElement();
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('Index', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234) AND (`Index` IN (1, 2, 10, 3));\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 10, 0, 0),\n' +
          '(1234, 3, 0, 0);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_spell` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_template_spell` (`CreatureID`, `Index`, `Spell`, `VerifiedBuild`) VALUES\n' +
          '(1234, 0, 0, 0),\n' +
          '(1234, 10, 0, 0),\n' +
          '(1234, 3, 0, 0);',
      );
      page.removeElement();
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('Index', 0);

      page.expectUniqueError();
      page.removeElement();
    });
  });
});
