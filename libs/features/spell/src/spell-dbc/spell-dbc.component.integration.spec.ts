import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { SpellHandlerService } from '../spell-handler.service';
import { SpellDbcComponent } from './spell-dbc.component';
import { LOCALES } from './texts/spell-dbc-texts.model';

describe('SpellDbc integration tests', () => {
  class SpellDbcPage extends EditorPageObject<SpellDbcComponent> {
    readonly tabsetId = 'spell-dbc-tabset';
    readonly localesTabsetId = 'locales';
  }

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `spell_dbc` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `spell_dbc` (`ID`, `Category`, `DispelType`, `Mechanic`, `Attributes`, `AttributesEx`, `AttributesEx2`, `AttributesEx3`, `AttributesEx4`, `AttributesEx5`, `AttributesEx6`, `AttributesEx7`, `ShapeshiftMask`, `unk_320_2`, `ShapeshiftExclude`, `unk_320_3`, `Targets`, `TargetCreatureType`, `RequiresSpellFocus`, `FacingCasterFlags`, `CasterAuraState`, `TargetAuraState`, `ExcludeCasterAuraState`, `ExcludeTargetAuraState`, `CasterAuraSpell`, `TargetAuraSpell`, `ExcludeCasterAuraSpell`, `ExcludeTargetAuraSpell`, `CastingTimeIndex`, `RecoveryTime`, `CategoryRecoveryTime`, `InterruptFlags`, `AuraInterruptFlags`, `ChannelInterruptFlags`, `ProcTypeMask`, `ProcChance`, `ProcCharges`, `MaxLevel`, `BaseLevel`, `SpellLevel`, `DurationIndex`, `PowerType`, `ManaCost`, `ManaCostPerLevel`, `ManaPerSecond`, `ManaPerSecondPerLevel`, `RangeIndex`, `Speed`, `ModalNextSpell`, `CumulativeAura`, `Totem_1`, `Totem_2`, `Reagent_1`, `Reagent_2`, `Reagent_3`, `Reagent_4`, `Reagent_5`, `Reagent_6`, `Reagent_7`, `Reagent_8`, `ReagentCount_1`, `ReagentCount_2`, `ReagentCount_3`, `ReagentCount_4`, `ReagentCount_5`, `ReagentCount_6`, `ReagentCount_7`, `ReagentCount_8`, `EquippedItemClass`, `EquippedItemSubclass`, `EquippedItemInvTypes`, `Effect_1`, `Effect_2`, `Effect_3`, `EffectDieSides_1`, `EffectDieSides_2`, `EffectDieSides_3`, `EffectRealPointsPerLevel_1`, `EffectRealPointsPerLevel_2`, `EffectRealPointsPerLevel_3`, `EffectBasePoints_1`, `EffectBasePoints_2`, `EffectBasePoints_3`, `EffectMechanic_1`, `EffectMechanic_2`, `EffectMechanic_3`, `ImplicitTargetA_1`, `ImplicitTargetA_2`, `ImplicitTargetA_3`, `ImplicitTargetB_1`, `ImplicitTargetB_2`, `ImplicitTargetB_3`, `EffectRadiusIndex_1`, `EffectRadiusIndex_2`, `EffectRadiusIndex_3`, `EffectAura_1`, `EffectAura_2`, `EffectAura_3`, `EffectAuraPeriod_1`, `EffectAuraPeriod_2`, `EffectAuraPeriod_3`, `EffectMultipleValue_1`, `EffectMultipleValue_2`, `EffectMultipleValue_3`, `EffectChainTargets_1`, `EffectChainTargets_2`, `EffectChainTargets_3`, `EffectItemType_1`, `EffectItemType_2`, `EffectItemType_3`, `EffectMiscValue_1`, `EffectMiscValue_2`, `EffectMiscValue_3`, `EffectMiscValueB_1`, `EffectMiscValueB_2`, `EffectMiscValueB_3`, `EffectTriggerSpell_1`, `EffectTriggerSpell_2`, `EffectTriggerSpell_3`, `EffectPointsPerCombo_1`, `EffectPointsPerCombo_2`, `EffectPointsPerCombo_3`, `EffectSpellClassMaskA_1`, `EffectSpellClassMaskA_2`, `EffectSpellClassMaskA_3`, `EffectSpellClassMaskB_1`, `EffectSpellClassMaskB_2`, `EffectSpellClassMaskB_3`, `EffectSpellClassMaskC_1`, `EffectSpellClassMaskC_2`, `EffectSpellClassMaskC_3`, `SpellVisualID_1`, `SpellVisualID_2`, `SpellIconID`, `ActiveIconID`, `SpellPriority`, `Name_Lang_enUS`, `Name_Lang_enGB`, `Name_Lang_koKR`, `Name_Lang_frFR`, `Name_Lang_deDE`, `Name_Lang_enCN`, `Name_Lang_zhCN`, `Name_Lang_enTW`, `Name_Lang_zhTW`, `Name_Lang_esES`, `Name_Lang_esMX`, `Name_Lang_ruRU`, `Name_Lang_ptPT`, `Name_Lang_ptBR`, `Name_Lang_itIT`, `Name_Lang_Unk`, `Name_Lang_Mask`, `NameSubtext_Lang_enUS`, `NameSubtext_Lang_enGB`, `NameSubtext_Lang_koKR`, `NameSubtext_Lang_frFR`, `NameSubtext_Lang_deDE`, `NameSubtext_Lang_enCN`, `NameSubtext_Lang_zhCN`, `NameSubtext_Lang_enTW`, `NameSubtext_Lang_zhTW`, `NameSubtext_Lang_esES`, `NameSubtext_Lang_esMX`, `NameSubtext_Lang_ruRU`, `NameSubtext_Lang_ptPT`, `NameSubtext_Lang_ptBR`, `NameSubtext_Lang_itIT`, `NameSubtext_Lang_Unk`, `NameSubtext_Lang_Mask`, `Description_Lang_enUS`, `Description_Lang_enGB`, `Description_Lang_koKR`, `Description_Lang_frFR`, `Description_Lang_deDE`, `Description_Lang_enCN`, `Description_Lang_zhCN`, `Description_Lang_enTW`, `Description_Lang_zhTW`, `Description_Lang_esES`, `Description_Lang_esMX`, `Description_Lang_ruRU`, `Description_Lang_ptPT`, `Description_Lang_ptBR`, `Description_Lang_itIT`, `Description_Lang_Unk`, `Description_Lang_Mask`, `AuraDescription_Lang_enUS`, `AuraDescription_Lang_enGB`, `AuraDescription_Lang_koKR`, `AuraDescription_Lang_frFR`, `AuraDescription_Lang_deDE`, `AuraDescription_Lang_enCN`, `AuraDescription_Lang_zhCN`, `AuraDescription_Lang_enTW`, `AuraDescription_Lang_zhTW`, `AuraDescription_Lang_esES`, `AuraDescription_Lang_esMX`, `AuraDescription_Lang_ruRU`, `AuraDescription_Lang_ptPT`, `AuraDescription_Lang_ptBR`, `AuraDescription_Lang_itIT`, `AuraDescription_Lang_Unk`, `AuraDescription_Lang_Mask`, `ManaCostPct`, `StartRecoveryCategory`, `StartRecoveryTime`, `MaxTargetLevel`, `SpellClassSet`, `SpellClassMask_1`, `SpellClassMask_2`, `SpellClassMask_3`, `MaxTargets`, `DefenseType`, `PreventionType`, `StanceBarOrder`, `EffectChainAmplitude_1`, `EffectChainAmplitude_2`, `EffectChainAmplitude_3`, `MinFactionID`, `MinReputation`, `RequiredAuraVision`, `RequiredTotemCategoryID_1`, `RequiredTotemCategoryID_2`, `RequiredAreasID`, `SchoolMask`, `RuneCostID`, `SpellMissileID`, `PowerDisplayID`, `EffectBonusMultiplier_1`, `EffectBonusMultiplier_2`, `EffectBonusMultiplier_3`, `SpellDescriptionVariableID`, `SpellDifficultyID`) VALUES\n' +
    "(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);";

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        RouterTestingModule,
        SpellDbcComponent,
        TranslateTestingModule,
      ],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const originalEntity = new SpellDbc();
    originalEntity.ID = id;

    const handlerService = TestBed.inject(SpellHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(SpellDbcComponent);
    const component = fixture.componentInstance;
    const page = new SpellDbcPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, querySpy, fixture, component, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'SchoolMask';
      expect(handlerService.isSpellDbcUnsaved).toBe(false);
      page.setInputValueById(field, 81);
      expect(handlerService.isSpellDbcUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isSpellDbcUnsaved).toBe(false);
      page.removeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      querySpy.calls.reset();

      const value = 12135;
      page.setInputValueById('Category', value);
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain(String(value));

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(String(value));
      page.removeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeElement();
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('DispelType', 111);
      page.expectDiffQueryToContain('UPDATE `spell_dbc` SET `DispelType` = 111 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(String(111));

      page.setInputValueById('Mechanic', 222);
      page.expectDiffQueryToContain('UPDATE `spell_dbc` SET `DispelType` = 111, `Mechanic` = 222 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(String(111));
      page.expectFullQueryToContain(String(222));
      page.removeElement();
    });
  });

  describe('Editing existing - tabs check', () => {
    const baseTabId = 'Base';
    const effectsTabId = 'Effects';
    const itemsTabId = 'Items';
    const flagsTabId = 'Flags';
    const textsTabId = 'Texts';
    const allTabIds = [baseTabId, effectsTabId, itemsTabId, flagsTabId, textsTabId];

    it('should correctly initialise', () => {
      const { page } = setup(false);
      const baseTab = page.getTab(page.tabsetId, baseTabId);
      const effectsTab = page.getTab(page.tabsetId, effectsTabId);
      const itemsTab = page.getTab(page.tabsetId, itemsTabId);
      const flagsTab = page.getTab(page.tabsetId, flagsTabId);
      const textsTab = page.getTab(page.tabsetId, textsTabId);
      page.expectTabActive(baseTab);
      page.expectTabInactive(effectsTab);
      page.expectTabInactive(itemsTab);
      page.expectTabInactive(flagsTab);
      page.expectTabInactive(textsTab);
    });

    describe('should allow to edit from every tab', () => {
      const cases: { tabId: string; field: string }[] = [
        { tabId: baseTabId, field: 'DurationIndex' },
        { tabId: effectsTabId, field: 'Targets' },
        { tabId: itemsTabId, field: 'EquippedItemClass' },
        { tabId: flagsTabId, field: 'Attributes' },
      ];

      for (const { tabId, field } of cases) {
        it(`tabId=${tabId}`, () => {
          const { page } = setup(false);
          const tab = page.getTab(page.tabsetId, tabId);

          page.clickElement(tab);
          page.expectTabActive(tab);

          for (const otherTabId of allTabIds) {
            if (otherTabId != tabId) {
              page.expectTabInactive(page.getTab(page.tabsetId, otherTabId));
            }
          }

          const testValue = 112233;
          page.setInputValueById(field, testValue);
          page.expectDiffQueryToContain('UPDATE `spell_dbc` SET `' + field + '` = ' + testValue + ' WHERE (`ID` = 1234);');
        });
      }
    });

    describe('Texts tab', () => {
      for (const locale of LOCALES) {
        it(`locale=${locale}`, () => {
          const { page } = setup(false);
          const tab = page.getTab(page.tabsetId, textsTabId);
          page.clickElement(tab);
          page.expectTabActive(tab);

          const localeTab = page.getTab(page.localesTabsetId, locale);
          page.clickElement(localeTab);
          page.expectTabActive(localeTab);

          for (const otherTabId of LOCALES) {
            if (otherTabId != locale) {
              page.expectTabInactive(page.getTab(page.localesTabsetId, otherTabId));
            }
          }

          const testValue = 'ChromieCraft';
          const field = `Name_Lang_${locale}`;
          page.setInputValueById(field, testValue);
          page.expectDiffQueryToContain('UPDATE `spell_dbc` SET `' + field + "` = '" + testValue + "' WHERE (`ID` = 1234);");
        });
      }
    });
  });
});
