import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { SaiEditorComponent } from './sai-editor.component';
import { SaiEditorModule } from './sai-editor.module';
import { SaiHandlerService } from './sai-handler.service';
import { MultiRowEditorPageObject } from '../../testing/multi-row-editor-page-object';
import { SAI_TYPES, SmartScripts } from '../../types/smart-scripts.type';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { SAI_EVENTS } from '@keira-shared/modules/sai-editor/constants/sai-event';
import { SAI_ACTIONS } from '@keira-shared/modules/sai-editor/constants/sai-actions';

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
  get targetXName() { return this.query<HTMLLabelElement>('label#label-target-x'); }
  get targetYName() { return this.query<HTMLLabelElement>('label#label-target-y'); }
  get targetZName() { return this.query<HTMLLabelElement>('label#label-target-z'); }
  get targetOName() { return this.query<HTMLLabelElement>('label#label-target-o'); }
  get errors() { return this.query<HTMLElement>('#errors'); }
  get eventType() { return this.getInputById('event_type'); }
  get generateCommentsBtn() { return this.query<HTMLButtonElement>('#generate-comments-btn'); }
}

describe('SaiEditorComponent integration tests', () => {
  let component: SaiEditorComponent;
  let fixture: ComponentFixture<SaiEditorComponent>;
  let handlerService: SaiHandlerService;
  let queryService: MysqlQueryService;
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SaiEditorModule,
        RouterTestingModule,
      ]
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean, hasTemplateQuery = false, st = sourceType) {
    const selected = { source_type: st, entryorguid: id };
    handlerService = TestBed.inject(SaiHandlerService);
    handlerService['_selected'] = JSON.stringify(selected);
    handlerService.isNew = creatingNew;

    if (hasTemplateQuery) {
      handlerService['_templateQuery'] = '-- Mock template query';
    }

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAllMultipleKeys').and.returnValue(of(
      creatingNew ? [] : [originalRow0, originalRow1, originalRow2]
    ));

    fixture = TestBed.createComponent(SaiEditorComponent);
    component = fixture.componentInstance;
    page = new SaiEditorPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  it('should correctly work when TimedActionlists', () => {
    setup(true, false, SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST);

    expect(page.event1Name.innerText).toEqual('minTimer');
    expect(page.event2Name.innerText).toBe('maxTimer');

    page.eventType.value = '1: 1';
    page.addNewRow();

    expect(page.eventType.disabled).toBe(true);
    expect(page.eventType.value).toBe('0: 0');
  });

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

    it('should correctly update the unsaved status', () => {
      expect(handlerService.isSaiUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isSaiUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isSaiUnsaved).toBe(false);
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

    it('generating comments should correctly work', async() => {
      const saiColIndex = 9;
      const name = 'Shin';
      spyOn(handlerService, 'getName').and.returnValue(of(name));
      page.addNewRow();
      page.addNewRow();
      page.addNewRow();
      component.editorService['_newRows'][0].event_type = SAI_EVENTS.AGGRO;
      component.editorService['_newRows'][0].action_type = SAI_ACTIONS.KILL_UNIT;
      component.editorService['_newRows'][1].event_type = SAI_EVENTS.DEATH;
      component.editorService['_newRows'][1].action_type = SAI_ACTIONS.ATTACK_START;
      component.editorService['_newRows'][2].event_type = SAI_EVENTS.EVADE;
      component.editorService['_newRows'][2].action_type = SAI_ACTIONS.FLEE_FOR_ASSIST;

      page.clickElement(page.generateCommentsBtn);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(page.getDatatableCell(0, saiColIndex).innerText)
        .toEqual(`${name} - On Aggro - Kill Target`);
      expect(page.getDatatableCell(1, saiColIndex).innerText)
        .toEqual(`${name} - On Just Died - Start Attacking`);
      expect(page.getDatatableCell(2, saiColIndex).innerText)
        .toEqual(`${name} - On Evade - Flee For Assist`);

      page.expectAllQueriesToContain(`${name} - On Aggro - Kill Target`);
      page.expectAllQueriesToContain(`${name} - On Just Died - Start Attacking`);
      page.expectAllQueriesToContain(`${name} - On Evade - Flee For Assist`);
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

    it('changing a value via FlagsSelector should correctly work', waitForAsync(async () => {
      const field = 'event_flags';
      page.clickRowOfDatatable(0);
      await page.whenReady();
      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.toggleFlagInRowExternal(1); // +2^1
      await page.whenReady();
      page.toggleFlagInRowExternal(3); // +2^3
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

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
    }));

    it('shows error on wrong linked event', () => {

      const mockRows: Partial<SmartScripts>[] = [
        { entryorguid: 0, source_type: 0, id: 0, link: 1, event_type: 0  },
        { entryorguid: 0, source_type: 0, id: 1, link: 0, event_type: 61 }
      ];

      component.editorService['_newRows'] = mockRows as SmartScripts[];
      component.editorService['checkRowsCorrectness']();
      expect(page.errors.innerText).not.toContain('ERROR');

      mockRows[1].event_type = 0;
      component.editorService['checkRowsCorrectness']();
      fixture.detectChanges();

      expect(page.errors.innerText).toContain(`ERROR: the SAI (id: `);

      mockRows[1].link = 3;
      component.editorService['checkRowsCorrectness']();
      fixture.detectChanges();

      expect(page.errors.innerText).toContain(`ERROR: non-existing links:`);
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
      expect(page.targetXName.innerText).toContain('TargetX');
      expect(page.targetYName.innerText).toContain('TargetY');
      expect(page.targetZName.innerText).toContain('TargetZ');
      expect(page.targetOName.innerText).toContain('TargetO');

      page.setSelectValueById('target_type', 9);

      expect(page.target1Name.innerText).toContain('CreatureId');
      expect(page.target2Name.innerText).toContain('MinDistance');
      expect(page.target3Name.innerText).toContain('MaxDistance');
      expect(page.target4Name.innerText).toContain('AliveState');

      page.setInputValueById('target_type', '28: 201'); // need this hack because option values are no longer in sequence at this point
      expect(page.targetOName.innerText).toContain('Resize');

      // TODO: add tests for target X, Y, Z dynamic names when they will be in use
    });
  });
});
