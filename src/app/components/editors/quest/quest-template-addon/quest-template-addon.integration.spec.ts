import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { QuestTemplateAddonComponent } from './quest-template-addon.component';
import { QuestTemplateAddonModule } from './quest-template-addon.module';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { QuestTemplateAddon } from '../../../../types/quest-template-addon.type';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';

class QuestTemplateAddonPage extends EditorPageObject<QuestTemplateAddonComponent> {}

describe('QuestTemplateAddon integration tests', () => {
  let component: QuestTemplateAddonComponent;
  let fixture: ComponentFixture<QuestTemplateAddonComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: QuestTemplateAddonPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, `PrevQuestID`, `NextQuestID`, ' +
    '`ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`,' +
    ' `RequiredMinRepFaction`, `RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, ' +
    '`SpecialFlags`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);';

  const originalEntity = new QuestTemplateAddon();
  originalEntity.ID = id;
  originalEntity.MaxLevel = 1;
  originalEntity.AllowableClasses = 2;
  originalEntity.SourceSpellID = 3;
  originalEntity.PrevQuestID = 4;
  originalEntity.NextQuestID = 5;
  originalEntity.ExclusiveGroup = 6;
  originalEntity.RewardMailTemplateID = 7;
  originalEntity.RewardMailDelay = 8;
  originalEntity.RequiredSkillID = 9;
  originalEntity.RequiredSkillPoints = 10;
  originalEntity.RequiredMinRepFaction = 11;
  originalEntity.RequiredMaxRepFaction = 12;
  originalEntity.RequiredMinRepValue = 13;
  originalEntity.RequiredMaxRepValue = 14;
  originalEntity.ProvidedItemCount = 15;
  originalEntity.SpecialFlags = 0;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        QuestTemplateAddonModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
    ));

    fixture = TestBed.createComponent(QuestTemplateAddonComponent);
    component = fixture.componentInstance;
    page = new QuestTemplateAddonPage(fixture);
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
      const expectedQuery = 'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, `PrevQuestID`, `NextQuestID`,' +
        ' `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`,' +
        ' `RequiredMinRepFaction`, `RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`,' +
        ' `SpecialFlags`) VALUES\n' +
        '(1234, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);';
      querySpy.calls.reset();

      page.setInputValueById('MaxLevel', 33);
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
      page.expectFullQueryToContain('DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, `PrevQuestID`, `NextQuestID`,' +
        ' `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`,' +
        ' `RequiredMinRepFaction`, `RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`,' +
        ' `SpecialFlags`) VALUES\n' +
        '(1234, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);');
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `quest_template_addon` SET ' +
        '`MaxLevel` = 0, `AllowableClasses` = 1, `SourceSpellID` = 2, `PrevQuestID` = 3, `NextQuestID` = 4, `ExclusiveGroup` = 5, ' +
        '`RewardMailTemplateID` = 6, `RewardMailDelay` = 7, `RequiredSkillID` = 8, `RequiredSkillPoints` = 9, ' +
        '`RequiredMinRepFaction` = 10, `RequiredMaxRepFaction` = 11, `RequiredMinRepValue` = 12, `RequiredMaxRepValue` = 13, ' +
        '`ProvidedItemCount` = 14, `SpecialFlags` = 15 WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('PrevQuestID', '11');
      page.expectDiffQueryToContain(
        'UPDATE `quest_template_addon` SET `PrevQuestID` = 11 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, ' +
        '`SourceSpellID`, `PrevQuestID`, `NextQuestID`, `ExclusiveGroup`, `RewardMailTemplateID`,' +
        ' `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, ' +
        '`RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
        '(1234, 1, 2, 3, 11, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);'
      );

      page.setInputValueById('NextQuestID', '22');
      page.expectDiffQueryToContain(
        'UPDATE `quest_template_addon` SET `PrevQuestID` = 11, `NextQuestID` = 22 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, ' +
        '`PrevQuestID`, `NextQuestID`, `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, ' +
        '`RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, `RequiredMaxRepFaction`, ' +
        '`RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
        '(1234, 1, 2, 3, 11, 22, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);'
      );
    });

    it('changing a value via FlagsSelector should correctly work', () => {
      const field = 'SpecialFlags';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.toggleFlagInRow(1);
      page.toggleFlagInRow(3);
      page.clickModalSelect();

      expect(page.getInputById(field).value).toEqual('10');
      page.expectDiffQueryToContain(
        'UPDATE `quest_template_addon` SET `SpecialFlags` = 10 WHERE (`ID` = 1234);'
      );

      page.expectFullQueryToContain('DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, ' +
        '`PrevQuestID`, `NextQuestID`, `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, ' +
        '`RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, `RequiredMaxRepFaction`, ' +
        '`RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
        '(1234, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 10)');
    });
  });
});
