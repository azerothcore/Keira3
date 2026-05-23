import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestTemplateAddon } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';
import { Model3DViewerService } from '@keira/shared/model-3d-viewer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { tickAsync } from 'ngx-page-object-model';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateAddonComponent } from './quest-template-addon.component';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, QuestTemplateAddonComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        { provide: Model3DViewerService, useValue: { generateModels: () => new Promise((resolve) => resolve({ destroy: () => {} })) } },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    const sqliteQuerySpy = vi.spyOn(sqliteQueryService, 'query').mockReturnValue(of([{ ID: 123, spellName: 'Mock Spell' }]));

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalEntity]));
    // by default the other editor services should not be initialised, because the selectAll would return the wrong types for them
    const initializeServicesSpy = vi.spyOn(TestBed.inject(QuestPreviewService), 'initializeServices').mockImplementation(() => undefined);
    if (creatingNew) {
      // when creatingNew, the selectAll will return an empty array, so it's fine
      initializeServicesSpy.mockRestore();
    }

    const fixture = TestBed.createComponent(QuestTemplateAddonComponent);
    const component = fixture.componentInstance;
    const page = new QuestTemplateAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, sqliteQuerySpy, initializeServicesSpy, fixture, component, page };
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
      expect(handlerService.isQuestTemplateAddonUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isQuestTemplateAddonUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isQuestTemplateAddonUnsaved()).toBe(false);
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
      querySpy.mockClear();

      page.setInputValueById('MaxLevel', 33);
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing a property should be reflected in the quest preview', async () => {
      const { page } = setup(true);
      const value = 80;
      page.detectChanges();

      page.setInputValueById('MaxLevel', value);
      await tickAsync();
      page.detectChanges();

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
      querySpy.mockClear();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
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

    it('changing a value via FlagsSelector should correctly work', async () => {
      const { page } = setup(false);
      const field = 'SpecialFlags';

      const result = await page.openFlagsAndToggle(field, [1, 3]);

      expect(result).toBe(10);
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `SpecialFlags` = 10 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain('10');
      page.removeNativeElement();
    });

    it('changing a value via SpellSelector should correctly work', async () => {
      const { page } = setup(false);
      const field = 'SourceSpellID';

      // SpellSelector reads spells from SqliteQueryService, which the setup spy already returns as { ID: 123, spellName: 'Mock Spell' }.
      const value = await page.openSelectorAndPickRow(field, 0, { clickSearch: true });

      expect(value).toEqual('123');
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `SourceSpellID` = 123 WHERE (`ID` = 1234);');
      page.removeNativeElement();
    });

    it('changing a value via QuestSelector should correctly work', async () => {
      const { page, querySpy } = setup(false);
      querySpy.mockReturnValue(of([{ ID: 123, LogTitle: 'Mock Quest' }]));

      const value = await page.openSelectorAndPickRow('NextQuestID', 0, { clickSearch: true });

      expect(value).toEqual('123');
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `NextQuestID` = 123 WHERE (`ID` = 1234);');
      page.removeNativeElement();
    });

    it('changing a value via SkillSelector should correctly work', async () => {
      const { page, sqliteQuerySpy } = setup(false);
      sqliteQuerySpy.mockReturnValue(of([{ id: 123, name: 'Mock Skill' }]));

      const value = await page.openSelectorAndPickRow('RequiredSkillID', 0, { clickSearch: true });

      expect(value).toEqual('123');
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `RequiredSkillID` = 123 WHERE (`ID` = 1234);');
      page.removeNativeElement();
    });

    it('changing a value via FactionSelector should correctly work', async () => {
      const { page, sqliteQuerySpy } = setup(false);
      sqliteQuerySpy.mockReturnValue(of([{ m_ID: 123, m_name_lang_1: 'Mock Faction' }]));

      const value = await page.openSelectorAndPickRow('RequiredMinRepFaction', 0, { clickSearch: true });

      expect(value).toEqual('123');
      page.expectDiffQueryToContain('UPDATE `quest_template_addon` SET `RequiredMinRepFaction` = 123 WHERE (`ID` = 1234);');
      page.removeNativeElement();
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(false);
      const written = await page.changeAllFieldsAsync(new QuestTemplateAddon(), ['VerifiedBuild']);

      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
    });

    it('shows an error toast when the save query fails', async () => {
      const { querySpy, page } = setup(false);
      page.setInputValueById('MaxLevel', 60);

      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();

      page.expectErrorToastVisible();
    });
  });
});
