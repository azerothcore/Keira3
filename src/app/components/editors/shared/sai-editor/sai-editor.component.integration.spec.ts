import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { SaiEditorComponent } from './sai-editor.component';
import { SaiEditorModule } from './sai-editor.module';
import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';
import { MultiRowEditorPageObject } from '../../../../test-utils/multi-row-editor-page-object';
import { SAI_TYPES, SmartScripts } from '../../../../types/smart-scripts.type';
import { QueryService } from '../../../../services/query.service';

class SaiEditorPage extends MultiRowEditorPageObject<SaiEditorComponent> {
  get event1Name() { return this.query<HTMLLabelElement>('label#label-event-param1'); }
  get event2Name() { return this.query<HTMLLabelElement>('label#label-event-param2'); }
  get event3Name() { return this.query<HTMLLabelElement>('label#label-event-param3'); }
  get event4Name() { return this.query<HTMLLabelElement>('label#label-event-param4'); }
  get event5Name() { return this.query<HTMLLabelElement>('label#label-event-param5'); }
  get action1Name() { return this.query<HTMLLabelElement>('label#label-action-param1'); }
  get action2Name() { return this.query<HTMLLabelElement>('label#label-action-param2'); }
  get action3Name() { return this.query<HTMLLabelElement>('label#label-action-param3'); }
  get action4Name() { return this.query<HTMLLabelElement>('label#label-action-param4'); }
  get action5Name() { return this.query<HTMLLabelElement>('label#label-action-param5'); }
  get action6Name() { return this.query<HTMLLabelElement>('label#label-action-param6'); }
  get target1Name() { return this.query<HTMLLabelElement>('label#label-target-param1'); }
  get target2Name() { return this.query<HTMLLabelElement>('label#label-target-param2'); }
  get target3Name() { return this.query<HTMLLabelElement>('label#label-target-param3'); }
  get target4Name() { return this.query<HTMLLabelElement>('label#label-target-param4'); }
  get errors() { return this.query<HTMLElement>('#errors'); }
}

describe('SaiEditorComponent integration tests', () => {
  let component: SaiEditorComponent;
  let fixture: ComponentFixture<SaiEditorComponent>;
  let handlerService: SaiHandlerService;
  let queryService: QueryService;
  let querySpy: Spy;
  let page: SaiEditorPage;

  const sourceType = SAI_TYPES.SAI_TYPE_CREATURE;
  const id = 1234;

  const originalRow0 = new SmartScripts();
  const originalRow1 = new SmartScripts();
  const originalRow2 = new SmartScripts();
  originalRow0.source_type = originalRow1.source_type = originalRow2.source_type = sourceType;
  originalRow0.entryorguid = originalRow1.entryorguid = originalRow2.entryorguid = id;
  originalRow0.id = 0;
  originalRow1.id = 1;
  originalRow2.id = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SaiEditorModule,
        RouterTestingModule,
      ]
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean, hasTemplateQuery = false) {
    const selected = { source_type: sourceType, entryorguid: id };
    handlerService = TestBed.get(SaiHandlerService);
    handlerService['_selected'] = JSON.stringify(selected);
    handlerService.isNew = creatingNew;

    if (hasTemplateQuery) {
      handlerService['_templateQuery'] = '-- Mock template query';
    }

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAllMultipleKeys').and.returnValue(of(
      { results: creatingNew ? [] : [originalRow0, originalRow1, originalRow2] }
    ));

    fixture = TestBed.createComponent(SaiEditorComponent);
    component = fixture.componentInstance;
    page = new SaiEditorPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('link').disabled).toBe(true);
      expect(page.getInputById('event_type').disabled).toBe(true);
      expect(page.getInputById('event_phase_mask').disabled).toBe(true);
      expect(page.getInputById('event_chance').disabled).toBe(true);
      expect(page.getInputById('event_flags').disabled).toBe(true);
      expect(page.getInputById('event_param1').disabled).toBe(true);
      expect(page.getInputById('event_param2').disabled).toBe(true);
      expect(page.getInputById('event_param3').disabled).toBe(true);
      expect(page.getInputById('event_param4').disabled).toBe(true);
      expect(page.getInputById('event_param5').disabled).toBe(true);
      expect(page.getInputById('action_type').disabled).toBe(true);
      expect(page.getInputById('action_param1').disabled).toBe(true);
      expect(page.getInputById('action_param2').disabled).toBe(true);
      expect(page.getInputById('action_param3').disabled).toBe(true);
      expect(page.getInputById('action_param4').disabled).toBe(true);
      expect(page.getInputById('action_param5').disabled).toBe(true);
      expect(page.getInputById('action_param6').disabled).toBe(true);
      expect(page.getInputById('target_type').disabled).toBe(true);
      expect(page.getInputById('target_param1').disabled).toBe(true);
      expect(page.getInputById('target_param2').disabled).toBe(true);
      expect(page.getInputById('target_param3').disabled).toBe(true);
      expect(page.getInputById('target_param4').disabled).toBe(true);
      expect(page.getInputById('target_x').disabled).toBe(true);
      expect(page.getInputById('target_y').disabled).toBe(true);
      expect(page.getInputById('target_z').disabled).toBe(true);
      expect(page.getInputById('target_o').disabled).toBe(true);
      expect(page.getInputById('comment').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0, 1, 2));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');';
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, ' +
        '`event_chance`, `event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, ' +
        '`event_chance`, `event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');'
      );

      page.setInputValueById('event_chance', 1);
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );

      page.setInputValueById('event_param1', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );

      page.setInputValueById('action_param2', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0)'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('target_param1', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('target_x', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (1, 2));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, \'\');\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, \'\');\n'
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('event_param2', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (1, 2, 3));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 3, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 3, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n');
    });

    it('changing a value via FlagsSelector should correctly work', async () => {
      const field = 'event_flags';
      page.clickRowOfDatatable(0);
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.toggleFlagInRow(1); // +2^1
      page.toggleFlagInRow(3); // +2^3
      page.clickModalSelect();
      await fixture.whenStable();
      await fixture.whenRenderingDone();

      expect(page.getInputById(field).value).toEqual('10');
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');'
      );

      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n'
      );
    });

    it('shows error on wrong linked event', () => {

      const mockRows: SmartScripts[] = [
        {
          entryorguid: 0,
          source_type: 0,
          id: 0,
          link: 1,
          event_type: 0,
          event_phase_mask: 0,
          event_chance: 100,
          event_flags: 0,
          event_param1: 0,
          event_param2: 0,
          event_param3: 0,
          event_param4: 0,
          event_param5: 0,
          action_type: 0,
          action_param1: 0,
          action_param2: 0,
          action_param3: 0,
          action_param4: 0,
          action_param5: 0,
          action_param6: 0,
          target_type: 0,
          target_param1: 0,
          target_param2: 0,
          target_param3: 0,
          target_param4: 0,
          target_x: 0,
          target_y: 0,
          target_z: 0,
          target_o: 0,
          comment: '',
        },
        {
          entryorguid: 0,
          source_type: 0,
          id: 1,
          link: 0,
          event_type: 61,
          event_phase_mask: 0,
          event_chance: 100,
          event_flags: 0,
          event_param1: 0,
          event_param2: 0,
          event_param3: 0,
          event_param4: 0,
          event_param5: 0,
          action_type: 0,
          action_param1: 0,
          action_param2: 0,
          action_param3: 0,
          action_param4: 0,
          action_param5: 0,
          action_param6: 0,
          target_type: 0,
          target_param1: 0,
          target_param2: 0,
          target_param3: 0,
          target_param4: 0,
          target_x: 0,
          target_y: 0,
          target_z: 0,
          target_o: 0,
          comment: '',
        }
      ];

      component.editorService['_newRows'] = mockRows;
      expect(page.errors.innerText).not.toContain('ERROR');

      mockRows[1].event_type = 0;
      component.editorService['checkRowsCorrectness']();
      fixture.detectChanges();

      expect(page.errors.innerText).toContain('ERROR: the SAI (id: ');

      mockRows[1].link = 3;
      component.editorService['checkRowsCorrectness']();
      fixture.detectChanges();

      expect(page.errors.innerText).toContain('ERROR: non-existing links:');
    });

  });

  describe('Template query', () => {
    beforeEach(() => setup(false, true));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        '-- Mock template query\n\n' +
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });
  });

  describe('Dynamic param names', () => {
    beforeEach(() => {
      setup(true);
      page.addNewRow();
    });

    it('event param names should correctly work', () => {
      page.setSelectValueById('event_type', 1);

      expect(page.event1Name.innerText).toContain('InitialMin');
      expect(page.event2Name.innerText).toContain('InitialMax');
      expect(page.event3Name.innerText).toContain('RepeatMin');
      expect(page.event4Name.innerText).toContain('RepeatMax');
      expect(page.event5Name.innerText).toContain('param5');

      page.setSelectValueById('event_type', 10);

      expect(page.event1Name.innerText).toContain('NoHostile');
      expect(page.event2Name.innerText).toContain('MaxRange');
      expect(page.event3Name.innerText).toContain('CooldownMin');
      expect(page.event4Name.innerText).toContain('CooldownMax');
      expect(page.event5Name.innerText).toContain('PlayerOnly');
    });

    it('action param names should correctly work', () => {
      page.setSelectValueById('action_type', 1);

      expect(page.action1Name.innerText).toContain('GroupId');
      expect(page.action2Name.innerText).toContain('Duration');
      expect(page.action3Name.innerText).toContain('Target');
      expect(page.action4Name.innerText).toContain('param4');
      expect(page.action5Name.innerText).toContain('param5');
      expect(page.action6Name.innerText).toContain('param6');

      page.setSelectValueById('action_type', 10);

      expect(page.action1Name.innerText).toContain('EmoteId1');
      expect(page.action2Name.innerText).toContain('EmoteId2');
      expect(page.action3Name.innerText).toContain('EmoteId3');
      expect(page.action4Name.innerText).toContain('EmoteId4');
      expect(page.action5Name.innerText).toContain('EmoteId5');
      expect(page.action6Name.innerText).toContain('EmoteId6');
    });

    it('target param names should correctly work', () => {
      page.setSelectValueById('target_type', 1);

      expect(page.target1Name.innerText).toContain('param1');
      expect(page.target2Name.innerText).toContain('param2');
      expect(page.target3Name.innerText).toContain('param3');
      expect(page.target4Name.innerText).toContain('param4');

      page.setSelectValueById('target_type', 9);

      expect(page.target1Name.innerText).toContain('CreatureId');
      expect(page.target2Name.innerText).toContain('MinDistance');
      expect(page.target3Name.innerText).toContain('MaxDistance');
      expect(page.target4Name.innerText).toContain('AliveState');
    });
  });
});
