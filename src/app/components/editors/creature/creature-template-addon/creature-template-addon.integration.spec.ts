import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CreatureTemplateAddonModule } from './creature-template-addon.module';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureTemplateAddon } from '../../../../types/creature-template-addon.type';

class CreatureTemplateAddonPage extends EditorPageObject<CreatureTemplateAddonComponent> {}

describe('CreatureTemplateAddon integration tests', () => {
  let component: CreatureTemplateAddonComponent;
  let fixture: ComponentFixture<CreatureTemplateAddonComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplateAddonPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `auras`) VALUES\n' +
    '(\'1234\', 0, 0, 0, 0, 0, \'\');';

  const originalEntity = new CreatureTemplateAddon();
  originalEntity.entry = id;
  originalEntity.auras = null;
  originalEntity.bytes1 = 1;
  originalEntity.bytes2 = 2;
  originalEntity.emote = 3;
  originalEntity.mount = 0;
  originalEntity.path_id = 123;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateAddonModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
    ));

    fixture = TestBed.createComponent(CreatureTemplateAddonComponent);
    component = fixture.componentInstance;
    page = new CreatureTemplateAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectDiffQueryHidden();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should create', () => {
      page.expectFullQueryToContain('DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `auras`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 3, NULL);');

      page.setInputValue(page.getInput('path_id'), '3');

      expect(component).toBeTruthy();
    });
  });

  // page.setInputValue(page.getInput('path_id'), '3');
});
