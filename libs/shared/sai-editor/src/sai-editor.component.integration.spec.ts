import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { SAI_ACTIONS } from './constants/sai-actions';
import { SAI_EVENTS } from './constants/sai-event';
import { SaiEditorComponent } from './sai-editor.component';
import { SaiHandlerService } from './sai-handler.service';

import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { tickAsync } from 'ngx-page-object-model';

class SaiEditorPage extends MultiRowEditorPageObject<SaiEditorComponent> {
  get event1Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-event-param1');
  }
  get event2Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-event-param2');
  }
  get event3Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-event-param3');
  }
  get event4Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-event-param4');
  }
  get event5Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-event-param5');
  }
  get action1Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-action-param1');
  }
  get action2Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-action-param2');
  }
  get action3Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-action-param3');
  }
  get action4Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-action-param4');
  }
  get action5Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-action-param5');
  }
  get action6Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-action-param6');
  }
  get target1Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-param1');
  }
  get target2Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-param2');
  }
  get target3Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-param3');
  }
  get target4Name(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-param4');
  }
  get targetXName(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-x');
  }
  get targetYName(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-y');
  }
  get targetZName(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-z');
  }
  get targetOName(): HTMLLabelElement {
    return this.query<HTMLLabelElement>('label#label-target-o');
  }
  get errors(): HTMLElement {
    return this.query<HTMLElement>('#errors');
  }
  get eventType(): HTMLInputElement {
    return this.getInputById('event_type');
  }
  get generateCommentsBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#generate-comments-btn');
  }
  get generateCommentSingleBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#generate-comments-btn-single');
  }
}

describe('SaiEditorComponent integration tests', () => {
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean, hasTemplateQuery = false, st = sourceType) {
    const selected = { source_type: st, entryorguid: id };
    const handlerService = TestBed.inject(SaiHandlerService);
    handlerService['_selected'] = JSON.stringify(selected);
    handlerService.isNew = creatingNew;

    if (hasTemplateQuery) {
      handlerService['_templateQuery'] = '-- Mock template query';
    }

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAllMultipleKeys').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(SaiEditorComponent);
    const component = fixture.componentInstance;
    const page = new SaiEditorPage(fixture);
    fixture.autoDetectChanges(true);
    page.detectChanges();

    return { component, fixture, handlerService, queryService, querySpy, page };
  }

  it('should correctly work when TimedActionlists', () => {
    const { page } = setup(true, false, SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST);

    expect(page.event1Name.innerText).toEqual('minTimer');
    expect(page.event2Name.innerText).toBe('maxTimer');

    page.eventType.value = '1: 1';
    page.addNewRow();

    expect(page.eventType.disabled).toBe(true);
    expect(page.eventType.value).toBe('0: 0');
  });

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
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
      expect(page.getInputById('event_param6').disabled).toBe(true);
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
      const { handlerService, page } = setup(true);
      expect(handlerService.isSaiUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isSaiUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isSaiUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0, 1, 2));\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
        "(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');";
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      // TODO: somehow the async pipe breaks these checks
      // expect(querySpy).toHaveBeenCalledTimes(1);
      // expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, ' +
          '`event_chance`, `event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, ' +
          '`event_chance`, `event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );

      page.setInputValueById('event_chance', 1);
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );

      page.setInputValueById('event_param1', '2');
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );

      page.setInputValueById('action_param2', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0));\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
    });

    it('adding a row, changing its values and duplicating it should correctly update the queries', () => {
      const { page } = setup(true);

      page.addNewRow();
      page.setInputValueById('event_chance', 1);
      page.setInputValueById('event_param1', '2');
      page.setInputValueById('action_param2', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (0, 1));\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 123, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
    });

    it('generating all comments should correctly work', async () => {
      const { component, handlerService, page } = setup(true);
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
      await tickAsync();

      expect(page.getDatatableCell(0, saiColIndex).innerText).toEqual(`${name} - On Aggro - Kill Target`);
      expect(page.getDatatableCell(1, saiColIndex).innerText).toEqual(`${name} - On Just Died - Start Attacking`);
      expect(page.getDatatableCell(2, saiColIndex).innerText).toEqual(`${name} - On Evade - Flee For Assist`);

      page.expectAllQueriesToContain(`${name} - On Aggro - Kill Target`);
      page.expectAllQueriesToContain(`${name} - On Just Died - Start Attacking`);
      page.expectAllQueriesToContain(`${name} - On Evade - Flee For Assist`);
    });

    it('generating selected row comment should correctly work', async () => {
      const { component, handlerService, page } = setup(true);
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

      page.clickElement(page.generateCommentSingleBtn);
      await tickAsync();

      expect(page.getDatatableCell(0, saiColIndex).innerText).toEqual(``);
      expect(page.getDatatableCell(1, saiColIndex).innerText).toEqual(``);
      expect(page.getDatatableCell(2, saiColIndex).innerText).toEqual(`${name} - On Evade - Flee For Assist`);

      page.expectAllQueriesToContain(`${name} - On Evade - Flee For Assist`);
    });

    it('the single-row generate comment should be disabled until a row is selected', () => {
      const { handlerService, page } = setup(true);
      const name = 'Shin';
      spyOn(handlerService, 'getName').and.returnValue(of(name));

      expect(page.generateCommentSingleBtn.disabled).toBe(true);

      page.addNewRow();
      expect(page.generateCommentSingleBtn.disabled).toBe(false);
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (1, 2));',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0)');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('target_param1', 1);

      page.clickRowOfDatatable(2);
      page.setInputValueById('target_x', 2);

      page.expectDiffQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`entryorguid` = 1234) AND (`source_type` = 0) AND (`id` IN (1, 2));\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, '');\n",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
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
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 3, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 3, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
    });

    xit('changing a value via FlagsSelector should correctly work', async () => {
      const { page } = setup(false);
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
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');",
      );

      page.expectFullQueryToContain(
        'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
    });

    describe('errors on wrong linked event', () => {
      it('case: no errors', () => {
        const { page } = setup(false);
        page.addNewRow();
        page.addNewRow();
        page.detectChanges();

        expect(page.errors.innerText).not.toContain('ERROR');
      });

      it('ERROR: the SAI (id:', () => {
        const { page } = setup(false);
        page.addNewRow();
        page.addNewRow();
        page.clickRowOfDatatable(1);
        page.setInputValueById('link', 1);
        page.clickRowOfDatatable(2);
        page.setInputValueById('event_type', 0);
        page.detectChanges();

        expect(page.errors.innerText).toContain(`ERROR: the SAI (id: `);
      });

      it('ERROR: non-existing links:', () => {
        const { page } = setup(false);
        page.addNewRow();
        page.addNewRow();
        page.clickRowOfDatatable(1);
        page.setInputValueById('event_type', 61);
        page.setInputValueById('link', 5);
        page.detectChanges();

        expect(page.errors.innerText).toContain(`ERROR: non-existing links:`);
      });
    });
  });

  describe('Template query', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false, true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        '-- Mock template query\n\n' +
          'DELETE FROM `smart_scripts` WHERE (`source_type` = 0 AND `entryorguid` = 1234);\n' +
          'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
          '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, `event_param6`, ' +
          '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
          '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
          '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
          "(1234, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ''),\n" +
          "(1234, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '');\n",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });
  });

  describe('Dynamic param names', () => {
    it('event param names should correctly work', () => {
      const { page } = setup(true);
      page.addNewRow();
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
      const { page } = setup(true);
      page.addNewRow();
      page.setSelectValueById('action_type', 1);

      expect(page.action1Name.innerText).toContain('GroupId');
      expect(page.action2Name.innerText).toContain('Duration');
      expect(page.action3Name.innerText).toContain('Target');
      expect(page.action4Name.innerText).toContain('Delay');
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
      const { page } = setup(true);
      page.addNewRow();
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
      expect(page.targetOName.innerText).toContain('TargetO');

      // TODO: add tests for target X, Y, Z dynamic names when they will be in use
    });
  });
});
