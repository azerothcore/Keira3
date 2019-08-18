import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { GameobjectTemplateAddonModule } from './gameobject-template-addon.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { GameobjectTemplateAddon } from '../../../../types/gameobject-template-addon.type';
import { GameobjectHandlerService } from '../../../../services/handlers/gameobject-handler.service';

class GameobjectTemplateAddonPage extends EditorPageObject<GameobjectTemplateAddonComponent> {}

describe('GameobjectTemplateAddon integration tests', () => {
  let component: GameobjectTemplateAddonComponent;
  let fixture: ComponentFixture<GameobjectTemplateAddonComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: GameobjectHandlerService;
  let page: GameobjectTemplateAddonPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' + id + ');\n' +
  'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`) VALUES\n' +
  '(' + id + ', 0, 0, 0, 0);';

  const originalEntity = new GameobjectTemplateAddon();
  originalEntity.entry = id;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectTemplateAddonModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
    ));

    fixture = TestBed.createComponent(GameobjectTemplateAddonComponent);
    component = fixture.componentInstance;
    page = new GameobjectTemplateAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' + id + ');\n' +
      'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`) VALUES\n' +
      '(' + id + ', 35, 0, 0, 0);';

      querySpy.calls.reset();

      page.setInputValueById('faction', '35');
      page.clickExecuteQuery();

      page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `gameobject_template_addon` SET ' +
      '`flags` = 1, `mingold` = 2, `maxgold` = 3 WHERE (`entry` = ' + id + ');';

      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('faction', '35');
      page.expectDiffQueryToContain(
        'UPDATE `gameobject_template_addon` SET `faction` = 35 WHERE (`entry` = ' + id + ');'
      );
      page.expectFullQueryToContain('35');

    });

    it('changing a value via FlagsSelector should correctly work', () => {
      const field = 'flags';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.toggleFlagInRow(1);
      page.toggleFlagInRow(3);
      page.clickModalSelect();

      expect(page.getInputById(field).value).toEqual('260');
      page.expectDiffQueryToContain(
        'UPDATE `gameobject_template_addon` SET `flags` = 260 WHERE (`entry` = ' + id + ');'
      );

      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' + id + ');\n' +
        'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`) VALUES\n' +
        '(' + id + ', 0, 260, 0, 0);'
      );
    });

  });

});
