import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
  CREATURE_EQUIP_TEMPLATE_TABLE,
  CREATURE_FORMATIONS_TABLE,
  CREATURE_LOOT_TEMPLATE_TABLE,
  CREATURE_ONKLL_REPUTATION_TABLE,
  CREATURE_QUESTITEM_TABLE,
  CREATURE_SPAWN_ADDON_TABLE,
  CREATURE_SPAWN_TABLE,
  CREATURE_TEMPLATE_ADDON_TABLE,
  CREATURE_TEMPLATE_MODEL_TABLE,
  CREATURE_TEMPLATE_MOVEMENT_TABLE,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
  CREATURE_TEMPLATE_SPELL_TABLE,
  CREATURE_TEMPLATE_TABLE,
  CREATURE_TEXT_TABLE,
  CREATURE_DEFAULT_TRAINER_TABLE,
  NPC_VENDOR_TABLE,
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  SAI_TABLE,
  SKINNING_LOOT_TEMPLATE_TABLE,
} from '@keira/shared/acore-world-model';
import { vi } from 'vitest';
import { CreatureHandlerService } from './creature-handler.service';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

describe('CreatureHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), CreatureHandlerService, SaiCreatureHandlerService],
    }),
  );

  it('should be created', () => {
    const service: CreatureHandlerService = TestBed.inject(CreatureHandlerService);
    expect(service).toBeTruthy();
  });

  // Source of truth for "every editor is wired into the dirty rollup".
  // `isCreatureSaiUnsaved` is intentionally excluded — it reads from SaiCreatureHandlerService.
  const statusMapEntries: ReadonlyArray<[keyof CreatureHandlerService, string]> = [
    ['isCreatureTemplateUnsaved', CREATURE_TEMPLATE_TABLE],
    ['isCreatureTemplateModelUnsaved', CREATURE_TEMPLATE_MODEL_TABLE],
    ['isCreatureTemplateAddonUnsaved', CREATURE_TEMPLATE_ADDON_TABLE],
    ['isCreatureTemplateResistanceUnsaved', CREATURE_TEMPLATE_RESISTANCE_TABLE],
    ['isCreatureTemplateSpellUnsaved', CREATURE_TEMPLATE_SPELL_TABLE],
    ['isCreatureTemplateMovementUnsaved', CREATURE_TEMPLATE_MOVEMENT_TABLE],
    ['isCreatureOnkillReputationUnsaved', CREATURE_ONKLL_REPUTATION_TABLE],
    ['isCreatureEquipTemplateUnsaved', CREATURE_EQUIP_TEMPLATE_TABLE],
    ['isNpcVendorUnsaved', NPC_VENDOR_TABLE],
    ['isCreatureDefaultTrainerUnsaved', CREATURE_DEFAULT_TRAINER_TABLE],
    ['isCreatureQuestitemUnsaved', CREATURE_QUESTITEM_TABLE],
    ['isCreatureLootTemplateUnsaved', CREATURE_LOOT_TEMPLATE_TABLE],
    ['isPickpocketingLootTemplateUnsaved', PICKPOCKETING_LOOT_TEMPLATE_TABLE],
    ['isSkinningLootTemplateUnsaved', SKINNING_LOOT_TEMPLATE_TABLE],
    ['isCreatureSpawnUnsaved', CREATURE_SPAWN_TABLE],
    ['isCreatureSpawnAddonUnsaved', CREATURE_SPAWN_ADDON_TABLE],
    ['isCreatureTextUnsaved', CREATURE_TEXT_TABLE],
    ['isCreatureFormationUnsaved', CREATURE_FORMATIONS_TABLE],
  ];

  it.each(statusMapEntries)('%s reflects the signal at %s', (getter, table) => {
    const service = TestBed.inject(CreatureHandlerService);
    const statusMap = (service as unknown as { _statusMap: Record<string, { set(v: boolean): void }> })._statusMap;

    statusMap[table].set(true);
    expect((service as unknown as Record<string, () => boolean>)[getter as string]()).toBe(true);

    statusMap[table].set(false);
    expect((service as unknown as Record<string, () => boolean>)[getter as string]()).toBe(false);
  });

  it('isCreatureSaiUnsaved reflects the signal at SAI_TABLE on SaiCreatureHandlerService', () => {
    const service = TestBed.inject(CreatureHandlerService);
    const sai = TestBed.inject(SaiCreatureHandlerService);
    const saiMap = (sai as unknown as { statusMap: Record<string, { set(v: boolean): void }> }).statusMap;

    saiMap[SAI_TABLE].set(true);
    expect(service.isCreatureSaiUnsaved()).toBe(true);

    saiMap[SAI_TABLE].set(false);
    expect(service.isCreatureSaiUnsaved()).toBe(false);
  });

  it('select() propagates to SaiCreatureHandlerService with source_type 0', () => {
    const service = TestBed.inject(CreatureHandlerService);
    const sai = TestBed.inject(SaiCreatureHandlerService);
    const spy = vi.spyOn(sai, 'select').mockImplementation(() => undefined as unknown as void);
    // Suppress router navigation (route table is empty in this TestBed) to keep the
    // assertion focused on the propagation behaviour.
    vi.spyOn(
      (service as unknown as { router: { navigate: (...args: unknown[]) => Promise<boolean> } }).router,
      'navigate',
    ).mockResolvedValue(true);

    service.select(false, 1234);

    expect(spy).toHaveBeenCalledWith(false, { entryorguid: 1234, source_type: 0 }, null, false);
  });
});
