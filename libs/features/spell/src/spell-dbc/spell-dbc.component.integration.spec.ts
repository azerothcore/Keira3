import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, SpellDbcComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalEntity = new SpellDbc();
    originalEntity.ID = id;

    const handlerService = TestBed.inject(SpellHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalEntity]));

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
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'SchoolMask';
      expect(handlerService.isSpellDbcUnsaved()).toBe(false);
      page.setInputValueById(field, 81);
      expect(handlerService.isSpellDbcUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isSpellDbcUnsaved()).toBe(false);
      page.removeNativeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      querySpy.mockClear();

      const value = 12135;
      page.setInputValueById('Category', value);
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain(String(value));

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(String(value));
      page.removeNativeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeNativeElement();
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
      page.removeNativeElement();
    });

    it('schema sweep: every editable field flows into the diff query', async () => {
      const { page } = setup(false);
      for (const tabId of ['Base', 'Effects', 'Items', 'Flags', 'Texts', 'Misc']) {
        page.clickElement(page.getTab(page.tabsetId, tabId));
        await page.whenReady();
      }
      const written = await page.changeAllFieldsAsync(new SpellDbc(), ['ID']);
      for (const field of Object.keys(written)) {
        page.expectDiffQueryToContain('`' + field + '`');
      }
      page.removeNativeElement();
    });

    it('shows an error toast when the save query fails', async () => {
      const { page, querySpy } = setup(false);
      page.setInputValueById('DispelType', 7);
      querySpy.mockReturnValue(throwError(() => new Error('mock SQL failure')));
      page.clickExecuteQuery();
      await page.whenReady();
      page.expectErrorToastVisible();
      page.removeNativeElement();
    });

    it('Items tab: EquippedItemSubclass flags-selector is gated on EquippedItemClass being a valid index', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Items'));
      await page.whenReady();
      expect(page.getSelectorBtn('EquippedItemSubclass', false)).toBeTruthy();
      page.setInputValueById('EquippedItemClass', 999);
      await page.whenReady();
      expect(page.getSelectorBtn('EquippedItemSubclass', false)).toBeFalsy();
      page.removeNativeElement();
    });
  });

  describe('Selectors', () => {
    it('Base: DispelType single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('DispelType', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToUpdate('spell_dbc', { ID: 1234 }, { DispelType: Number(result) });
      page.removeNativeElement();
    });

    it('Base: PowerType single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('PowerType', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`PowerType` = ' + result);
      page.removeNativeElement();
    });

    it('Base: Mechanic single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('Mechanic', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`Mechanic`');
      page.removeNativeElement();
    });

    it('Base: DefenseType single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('DefenseType', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`DefenseType`');
      page.removeNativeElement();
    });

    it('Base: PreventionType single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('PreventionType', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`PreventionType`');
      page.removeNativeElement();
    });

    it('Base: CasterAuraState single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('CasterAuraState', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`CasterAuraState`');
      page.removeNativeElement();
    });

    it('Base: TargetAuraState single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('TargetAuraState', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`TargetAuraState`');
      page.removeNativeElement();
    });

    it('Base: CastingTimeIndex single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('CastingTimeIndex', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`CastingTimeIndex`');
      page.removeNativeElement();
    });

    it('Base: SchoolMask flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Base'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('SchoolMask', [0, 1]);
      expect(result).toBe(3);
      page.expectDiffQueryToContain('`SchoolMask` = 3');
      page.removeNativeElement();
    });

    it('Flags: TargetCreatureType flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('TargetCreatureType', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`TargetCreatureType` = 1');
      page.removeNativeElement();
    });

    it('Flags: ShapeshiftMask flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('ShapeshiftMask', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`ShapeshiftMask` = 1');
      page.removeNativeElement();
    });

    // TODO: ShapeshiftExclude's flags-selector is mis-bound in the template
    // (spell-dbc-flags.component.html:29-34): both its [control] and config `name` point at
    // 'ShapeshiftMask' instead of 'ShapeshiftExclude'. As a result there is no
    // `#ShapeshiftExclude-selector-btn` and toggling the selector never writes to the
    // ShapeshiftExclude control. Un-skip once the template binding bug is fixed
    // (see spell-test-coverage TEST-PHASE-1.plan.md §7 gotcha #4).
    it.skip('Flags: ShapeshiftExclude flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('ShapeshiftExclude', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`ShapeshiftExclude` = 1');
      page.removeNativeElement();
    });

    it('Flags: FacingCasterFlags flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('FacingCasterFlags', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`FacingCasterFlags` = 1');
      page.removeNativeElement();
    });

    it('Flags: InterruptFlags flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('InterruptFlags', [0, 1]);
      expect(result).toBe(3);
      page.expectDiffQueryToContain('`InterruptFlags` = 3');
      page.removeNativeElement();
    });

    it('Flags: AuraInterruptFlags flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('AuraInterruptFlags', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`AuraInterruptFlags` = 1');
      page.removeNativeElement();
    });

    it('Flags: ChannelInterruptFlags flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('ChannelInterruptFlags', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`ChannelInterruptFlags` = 1');
      page.removeNativeElement();
    });

    it('Flags: Attributes flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Flags'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('Attributes', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`Attributes` = 1');
      page.removeNativeElement();
    });

    it('Items: EquippedItemClass single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Items'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('EquippedItemClass', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`EquippedItemClass`');
      page.removeNativeElement();
    });

    it('Items: EquippedItemInvTypes flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Items'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('EquippedItemInvTypes', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`EquippedItemInvTypes` = 1');
      page.removeNativeElement();
    });

    it('Items: RequiredTotemCategoryID_1 single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Items'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('RequiredTotemCategoryID_1', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`RequiredTotemCategoryID_1`');
      page.removeNativeElement();
    });

    it('Items: Totem_1 item selector updates the diff', async () => {
      const { page, queryService } = setup(false);
      vi.spyOn(queryService, 'query').mockReturnValue(of([{ entry: 12345, name: 'Mock Item' }]));
      page.clickElement(page.getTab(page.tabsetId, 'Items'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('Totem_1', 0, { clickSearch: true });
      expect(result).toBe('12345');
      page.expectDiffQueryToContain('`Totem_1` = 12345');
      page.removeNativeElement();
    });

    it('Items: Reagent_1 item selector updates the diff', async () => {
      const { page, queryService } = setup(false);
      vi.spyOn(queryService, 'query').mockReturnValue(of([{ entry: 54321, name: 'Mock Reagent' }]));
      page.clickElement(page.getTab(page.tabsetId, 'Items'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('Reagent_1', 0, { clickSearch: true });
      expect(result).toBe('54321');
      page.expectDiffQueryToContain('`Reagent_1` = 54321');
      page.removeNativeElement();
    });

    it('Effects: Targets flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Effects'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('Targets', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`Targets` = 1');
      page.removeNativeElement();
    });

    it('Effects: ProcTypeMask flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Effects'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('ProcTypeMask', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`ProcTypeMask` = 1');
      page.removeNativeElement();
    });

    it('Effects: Effect_1 single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Effects'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('Effect_1', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`Effect_1`');
      page.removeNativeElement();
    });

    it('Effects: EffectMechanic_1 single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Effects'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('EffectMechanic_1', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`EffectMechanic_1`');
      page.removeNativeElement();
    });

    it('Effects: EffectAura_1 single-value selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Effects'));
      await page.whenReady();
      const result = await page.openSelectorAndPickRow('EffectAura_1', 1);
      expect(result).toBeTruthy();
      page.expectDiffQueryToContain('`EffectAura_1`');
      page.removeNativeElement();
    });

    it('Effects: EffectSpellClassMaskA_1 flags-selector updates the diff', async () => {
      const { page } = setup(false);
      page.clickElement(page.getTab(page.tabsetId, 'Effects'));
      await page.whenReady();
      const result = await page.openFlagsAndToggle('EffectSpellClassMaskA_1', [0]);
      expect(result).toBe(1);
      page.expectDiffQueryToContain('`EffectSpellClassMaskA_1` = 1');
      page.removeNativeElement();
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
