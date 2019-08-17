import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateModule } from './gameobject-template.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { GameobjectTemplate } from '../../../../types/gameobject-template.type';
import { GameobjectHandlerService } from '../../../../services/handlers/gameobject-handler.service';

class GameobjectTemplatePage extends EditorPageObject<GameobjectTemplateComponent> {}

describe('GameobjectTemplate integration tests', () => {
  let component: GameobjectTemplateComponent;
  let fixture: ComponentFixture<GameobjectTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: GameobjectHandlerService;
  let page: GameobjectTemplatePage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `gameobject_template` WHERE (`entry` = ' + id + ');\n' +
  'INSERT INTO `gameobject_template` (`entry`, `type`, `displayId`, `name`, `IconName`, `castBarCaption`, ' +
  '`unk1`, `size`, `Data0`, `Data1`, `Data2`, `Data3`, `Data4`, `Data5`, `Data6`, `Data7`, `Data8`, `Data9`, ' +
  '`Data10`, `Data11`, `Data12`, `Data13`, `Data14`, `Data15`, `Data16`, `Data17`, `Data18`, `Data19`, `Data20`, ' +
  '`Data21`, `Data22`, `Data23`, `AIName`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
  '(' + id + ', 0, 0, \'\', \'\', \'\', \'\', 1, 0, 0, 0, 0, 0, 0, 0, ' +
  '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\', 0);';

  const originalEntity = new GameobjectTemplate();
  originalEntity.entry = id;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectTemplateModule,
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

    fixture = TestBed.createComponent(GameobjectTemplateComponent);
    component = fixture.componentInstance;
    page = new GameobjectTemplatePage(fixture);
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
      const expectedQuery = 'DELETE FROM `gameobject_template` WHERE (`entry` = ' + id + ');\n' +
      'INSERT INTO `gameobject_template` (`entry`, `type`, `displayId`, `name`, `IconName`, `castBarCaption`, ' +
      '`unk1`, `size`, `Data0`, `Data1`, `Data2`, `Data3`, `Data4`, `Data5`, `Data6`, `Data7`, `Data8`, `Data9`, ' +
      '`Data10`, `Data11`, `Data12`, `Data13`, `Data14`, `Data15`, `Data16`, `Data17`, `Data18`, `Data19`, `Data20`, ' +
      '`Data21`, `Data22`, `Data23`, `AIName`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
      '(' + id + ', 0, 0, \'Helias\', \'\', \'\', \'\', 1, 0, 0, 0, 0, 0, 0, 0, ' +
      '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\', 0);';

      querySpy.calls.reset();

      page.setInputValueById('name', 'Helias');
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
      const expectedQuery = 'UPDATE `gameobject_template` SET `displayId` = 1, `name` = \'2\', `IconName` = \'3\', ' +
      '`castBarCaption` = \'4\', `unk1` = \'5\', `size` = 6, `Data0` = 7, `Data1` = 8, `Data2` = 9, `Data3` = 10, ' +
      '`Data4` = 11, `Data5` = 12, `Data6` = 13, `Data7` = 14, `Data8` = 15, `Data9` = 16, `Data10` = 17, `Data11` = 18, ' +
      '`Data12` = 19, `Data13` = 20, `Data14` = 21, `Data15` = 22, `Data16` = 23, `Data17` = 24, `Data18` = 25, ' +
      '`Data19` = 26, `Data20` = 27, `Data21` = 28, `Data22` = 29, `Data23` = 30, `AIName` = \'31\', ' +
      '`ScriptName` = \'32\' WHERE (`entry` = 1234);';

      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('name', 'Helias');
      page.expectDiffQueryToContain(
        'UPDATE `gameobject_template` SET `name` = \'Helias\' WHERE (`entry` = ' + id + ');'
      );
      page.expectFullQueryToContain('Helias');

      page.setInputValueById('Data0', '35');
      page.expectDiffQueryToContain(
        'UPDATE `gameobject_template` SET `name` = \'Helias\', `Data0` = 35 WHERE (`entry` = ' + id + ');'
      );
      page.expectFullQueryToContain('Helias');
      page.expectFullQueryToContain('35');
    });

    it('changing a value via SingleValueSelector should correctly work', () => {
      const field = 'type';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.clickRowOfDatatable(7);
      page.clickModalSelect();

      expect(page.getInputById(field).value).toEqual('7');
      page.expectDiffQueryToContain(
        'UPDATE `gameobject_template` SET `type` = 7 WHERE (`entry` = ' + id + ');'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_template` WHERE (`entry` = ' + id + ');\n' +
        'INSERT INTO `gameobject_template` (`entry`, `type`, `displayId`, `name`, `IconName`, `castBarCaption`, ' +
        '`unk1`, `size`, `Data0`, `Data1`, `Data2`, `Data3`, `Data4`, `Data5`, `Data6`, `Data7`, `Data8`, `Data9`, ' +
        '`Data10`, `Data11`, `Data12`, `Data13`, `Data14`, `Data15`, `Data16`, `Data17`, `Data18`, `Data19`, `Data20`, ' +
        '`Data21`, `Data22`, `Data23`, `AIName`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        '(' + id + ', 7, 0, \'\', \'\', \'\', \'\', 1, 0, 0, 0, 0, 0, 0, 0, ' +
        '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\', 0);'
      );
    });
  });

});
