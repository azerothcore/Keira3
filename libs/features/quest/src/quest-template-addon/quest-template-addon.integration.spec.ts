import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { QuestTemplateAddon } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateAddonComponent } from './quest-template-addon.component';
import Spy = jasmine.Spy;

class QuestTemplateAddonPage extends EditorPageObject<QuestTemplateAddonComponent> {
  get questPreviewReqLevel() {
    return this.query(`${this.PREVIEW_CONTAINER_SELECTOR} #minlevel`);
  }
}

describe('QuestTemplateAddon integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        RouterTestingModule,
        QuestTemplateAddonComponent,
        TranslateTestingModule,
      ],
      providers: [{ provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(sqliteQueryService, 'query').and.returnValue(of([{ ID: 123, spellName: 'Mock Spell' }]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));
    // by default the other editor services should not be initialised, because the selectAll would return the wrong types for them
    const initializeServicesSpy = spyOn(TestBed.inject(QuestPreviewService), 'initializeServices');
    if (creatingNew) {
      // when creatingNew, the selectAll will return an empty array, so it's fine
      initializeServicesSpy.and.callThrough();
    }

    const fixture = TestBed.createComponent(QuestTemplateAddonComponent);
    const component = fixture.componentInstance;
    const page = new QuestTemplateAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, initializeServicesSpy, fixture, component, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'NextQuestID';
      expect(handlerService.isQuestTemplateAddonUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isQuestTemplateAddonUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isQuestTemplateAddonUnsaved).toBe(false);
      page.removeNativeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, `PrevQuestID`, `NextQuestID`,' +
        ' `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`,' +
        ' `RequiredMinRepFaction`, `RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`,' +
        ' `SpecialFlags`) VALUES\n' +
        '(1234, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);';
      querySpy.calls.reset();

      page.setInputValueById('MaxLevel', 33);
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing a property should be reflected in the quest preview', () => {
      const { page } = setup(true);
      const value = 80;

      page.setInputValueById('MaxLevel', value);

      expect(page.questPreviewReqLevel.innerText).toContain(`0 - ${value}`);
      page.removeNativeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, `PrevQuestID`, `NextQuestID`,' +
          ' `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`,' +
          ' `RequiredMinRepFaction`, `RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`,' +
          ' `SpecialFlags`) VALUES\n' +
          '(1234, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);',
      );
      page.removeNativeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery =
        'UPDATE `quest_template_addon` SET ' +
        '`MaxLevel` = 0, `AllowableClasses` = 1, `SourceSpellID` = 2, `PrevQuestID` = 3, `NextQuestID` = 4, `ExclusiveGroup` = 5, ' +
        '`RewardMailTemplateID` = 6, `RewardMailDelay` = 7, `RequiredSkillID` = 8, `RequiredSkillPoints` = 9, ' +
        '`RequiredMinRepFaction` = 10, `RequiredMaxRepFaction` = 11, `RequiredMinRepValue` = 12, `RequiredMaxRepValue` = 13, ' +
        '`ProvidedItemCount` = 14, `SpecialFlags` = 15 WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(2); // 2 because the preview also calls it
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      page.setInputValueById('PrevQuestID', '11');
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `PrevQuestID` = 11 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, ' +
          '`SourceSpellID`, `PrevQuestID`, `NextQuestID`, `ExclusiveGroup`, `RewardMailTemplateID`,' +
          ' `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, ' +
          '`RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
          '(1234, 1, 2, 3, 11, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);',
      );

      page.setInputValueById('NextQuestID', '22');
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `PrevQuestID` = 11, `NextQuestID` = 22 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, ' +
          '`PrevQuestID`, `NextQuestID`, `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, ' +
          '`RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, `RequiredMaxRepFaction`, ' +
          '`RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
          '(1234, 1, 2, 3, 11, 22, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);',
      );
      page.removeNativeElement();
    });

    xit('changing a value via FlagsSelector should correctly work', waitForAsync(async () => {
      const { page } = setup(false);
      const field = 'SpecialFlags';
      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.toggleFlagInRowExternal(1);
      await page.whenReady();
      page.toggleFlagInRowExternal(3);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('10');
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `SpecialFlags` = 10 WHERE (`ID` = 1234);');

      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, ' +
          '`PrevQuestID`, `NextQuestID`, `ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, ' +
          '`RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, `RequiredMaxRepFaction`, ' +
          '`RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
          '(1234, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 10)',
      );
      page.removeNativeElement();
    }));

    xit('changing a value via SpellSelector should correctly work', waitForAsync(async () => {
      const { page } = setup(false);

      //  note: previously disabled because of:
      //  https://stackoverflow.com/questions/57336982/how-to-make-angular-tests-wait-for-previous-async-operation-to-complete-before-e

      const field = 'SourceSpellID';
      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.clickSearchBtn();

      await page.whenStable();
      page.clickRowOfDatatableInModal(0);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `SourceSpellID` = 123 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, `PrevQuestID`, `NextQuestID`, ' +
          '`ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, ' +
          '`RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
          '(1234, 1, 2, 123, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);',
      );
      page.removeNativeElement();
    }));

    xit('changing a value via QuestSelector should correctly work', waitForAsync(async () => {
      const { page, fixture } = setup(false);
      const field = 'NextQuestID';
      const mysqlQueryService = TestBed.inject(MysqlQueryService);
      (mysqlQueryService.query as Spy).and.returnValue(of([{ ID: 123, LogTitle: 'Mock Quest' }]));

      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.clickSearchBtn();

      await fixture.whenStable();
      page.clickRowOfDatatableInModal(0);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `NextQuestID` = 123 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_template_addon` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_template_addon` (`ID`, `MaxLevel`, `AllowableClasses`, `SourceSpellID`, `PrevQuestID`, `NextQuestID`, ' +
          '`ExclusiveGroup`, `RewardMailTemplateID`, `RewardMailDelay`, `RequiredSkillID`, `RequiredSkillPoints`, `RequiredMinRepFaction`, ' +
          '`RequiredMaxRepFaction`, `RequiredMinRepValue`, `RequiredMaxRepValue`, `ProvidedItemCount`, `SpecialFlags`) VALUES\n' +
          '(1234, 1, 2, 3, 4, 123, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0);',
      );
      page.removeNativeElement();
    }));
  });
});
