import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira/test-utils';
import { EditorPageObject } from '@keira/test-utils';
import { GameobjectTemplateAddon } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { GameobjectTemplateAddonModule } from './gameobject-template-addon.module';
import Spy = jasmine.Spy;

class GameobjectTemplateAddonPage extends EditorPageObject<GameobjectTemplateAddonComponent> {}

describe('GameobjectTemplateAddon integration tests', () => {
  let fixture: ComponentFixture<GameobjectTemplateAddonComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GameobjectHandlerService;
  let page: GameobjectTemplateAddonPage;

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' +
    id +
    ');\n' +
    'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`, `artkit0`, `artkit1`, `artkit2`, `artkit3`) VALUES\n' +
    '(' +
    id +
    ', 0, 0, 0, 0, 0, 0, 0, 0);';

  const originalEntity = new GameobjectTemplateAddon();
  originalEntity.entry = id;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), GameobjectTemplateAddonModule, RouterTestingModule, TranslateTestingModule],
      providers: [GameobjectHandlerService, SaiGameobjectHandlerService],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(GameobjectHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    fixture = TestBed.createComponent(GameobjectTemplateAddonComponent);
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

    it('should correctly update the unsaved status', () => {
      const field = 'faction';
      expect(handlerService.isGameobjectTemplateAddonUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isGameobjectTemplateAddonUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isGameobjectTemplateAddonUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery =
        'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' +
        id +
        ');\n' +
        'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`, `artkit0`, `artkit1`, `artkit2`, `artkit3`) VALUES\n' +
        '(' +
        id +
        ', 35, 0, 0, 0, 0, 0, 0, 0);';

      querySpy.calls.reset();

      page.setInputValueById('faction', '35');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

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
      const expectedQuery =
        'UPDATE `gameobject_template_addon` SET ' +
        '`flags` = 1, `mingold` = 2, `maxgold` = 3, `artkit0` = 4, `artkit1` = 5, `artkit2` = 6, `artkit3` = 7 WHERE (`entry` = ' +
        id +
        ');';

      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('faction', '35');
      page.expectDiffQueryToContain('UPDATE `gameobject_template_addon` SET `faction` = 35 WHERE (`entry` = ' + id + ');');
      page.expectFullQueryToContain('35');
    });

    xit('changing a value via FlagsSelector should correctly work', waitForAsync(async () => {
      const field = 'flags';
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
      page.expectDiffQueryToContain('UPDATE `gameobject_template_addon` SET `flags` = 10 WHERE (`entry` = ' + id + ');');

      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_template_addon` WHERE (`entry` = ' +
          id +
          ');\n' +
          'INSERT INTO `gameobject_template_addon` (`entry`, `faction`, `flags`, `mingold`, `maxgold`, `artkit0`, `artkit1`, `artkit2`, `artkit3`) VALUES\n' +
          '(' +
          id +
          ', 0, 10, 0, 0, 0, 0, 0, 0);',
      );
    }));
  });
});
