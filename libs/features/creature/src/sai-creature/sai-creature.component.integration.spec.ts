import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedSqliteService, MysqlQueryService, SqliteService } from '@keira/shared/core';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiCreatureComponent } from './sai-creature.component';
import { instance } from 'ts-mockito';

class SaiCreaturePage extends MultiRowEditorPageObject<SaiCreatureComponent> {}

describe('SaiCreatureComponent integration tests', () => {
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
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        SaiCreatureComponent,
        RouterTestingModule,
        TranslateTestingModule,
      ],
      providers: [CreatureHandlerService, SaiCreatureHandlerService, { provide: SqliteService, useValue: instance(MockedSqliteService) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean, hasTemplateQuery = false, st = sourceType) {
    const selected = { source_type: st, entryorguid: id };
    const handlerService = TestBed.inject(SaiCreatureHandlerService);
    handlerService['_selected'] = JSON.stringify(selected);
    handlerService.isNew = creatingNew;

    if (hasTemplateQuery) {
      handlerService['_templateQuery'] = '-- Mock template query';
    }

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAllMultipleKeys').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(SaiCreatureComponent);
    const component = fixture.componentInstance;
    const page = new SaiCreaturePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, fixture, component, page };
  }

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
      const { page } = setup(true);
      const creatureHandlerService = TestBed.inject(CreatureHandlerService);
      expect(creatureHandlerService.isCreatureSaiUnsaved).toBe(false);
      page.addNewRow();
      expect(creatureHandlerService.isCreatureSaiUnsaved).toBe(true);
      page.deleteRow();
      expect(creatureHandlerService.isCreatureSaiUnsaved).toBe(false);
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
  });
});
