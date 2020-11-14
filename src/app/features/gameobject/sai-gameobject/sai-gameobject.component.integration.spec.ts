import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { SaiGameobjectComponent } from './sai-gameobject.component';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiGameobjectModule } from './sai-gameobject.module';
import { GameobjectHandlerService } from '../gameobject-handler.service';

class SaiGameobjectPage extends MultiRowEditorPageObject<SaiGameobjectComponent> {}

describe('SaiGameobjectComponent integration tests', () => {
  let component: SaiGameobjectComponent;
  let fixture: ComponentFixture<SaiGameobjectComponent>;
  let handlerService: SaiGameobjectHandlerService;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let page: SaiGameobjectPage;

  const sourceType = SAI_TYPES.SAI_TYPE_GAMEOBJECT;
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
        SaiGameobjectModule,
        RouterTestingModule,
      ],
      providers: [
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ]
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean, hasTemplateQuery = false, st = sourceType) {
    const selected = { source_type: st, entryorguid: id };
    handlerService = TestBed.inject(SaiGameobjectHandlerService);
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

    fixture = TestBed.createComponent(SaiGameobjectComponent);
    component = fixture.componentInstance;
    page = new SaiGameobjectPage(fixture);
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

    it('should correctly update the unsaved status', () => {
      const gameobjectHandlerService = TestBed.inject(GameobjectHandlerService);
      expect(gameobjectHandlerService.isGameobjectSaiUnsaved).toBe(false);
      page.addNewRow();
      expect(gameobjectHandlerService.isGameobjectSaiUnsaved).toBe(true);
      page.deleteRow();
      expect(gameobjectHandlerService.isGameobjectSaiUnsaved).toBe(false);
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `smart_scripts` WHERE (`source_type` = 1 AND `entryorguid` = 1234);\n' +
        'INSERT INTO `smart_scripts` (`entryorguid`, `source_type`, `id`, `link`, `event_type`, `event_phase_mask`, `event_chance`, ' +
        '`event_flags`, `event_param1`, `event_param2`, `event_param3`, `event_param4`, `event_param5`, ' +
        '`action_type`, `action_param1`, `action_param2`, `action_param3`, `action_param4`, `action_param5`, `action_param6`, ' +
        '`target_type`, `target_param1`, `target_param2`, `target_param3`, `target_param4`, ' +
        '`target_x`, `target_y`, `target_z`, `target_o`, `comment`) VALUES\n' +
        '(1234, 1, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 1, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\'),\n' +
        '(1234, 1, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\');\n');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });
  });
});
