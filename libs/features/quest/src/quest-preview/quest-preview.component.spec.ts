import { vi, type MockInstance } from 'vitest';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectorRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { QuestOfferReward, QuestRequestItems, QuestTemplate, QuestTemplateAddon } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { Class } from '@keira/shared/constants';
import { MysqlQueryService, SqliteQueryService } from '@keira/shared/db-layer';
import { Model3DViewerService } from '@keira/shared/model-3d-viewer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ToastrModule } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { QuestPreviewComponent } from './quest-preview.component';
import { QUEST_FACTION_REWARD } from './quest-preview.model';
import { QuestPreviewService } from './quest-preview.service';

class QuestPreviewComponentPage extends PageObject<QuestPreviewComponent> {
  get title(): HTMLHeadElement {
    return this.query<HTMLHeadElement>('#title');
  }
  get level(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#level');
  }
  get minLevel(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#minlevel');
  }
  get creatureQuestStartIcon(): HTMLImageElement {
    return this.query<HTMLImageElement>('#creatureQuestStartIcon');
  }
  get creatureQuestEndIcon(): HTMLImageElement {
    return this.query<HTMLImageElement>('#creatureQuestEndIcon');
  }
  get questType(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#type');
  }
  get classes(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#classes');
  }
  get requiredSkill(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#requiredSkill');
  }
  get rewardXP(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#rewardXP');
  }
  get rewardTalents(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#rewardTalents');
  }
  get rewardReputations(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#rewardReputations');
  }
  get providedItem(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#provided-item');
  }
  get areaDescription(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#areaDescription');
  }
  get npcOrGoObjectives(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#npcOrGoObjectives');
  }
  get itemObjectives(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#itemObjectives');
  }
  get RequiredFaction(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#RequiredFaction');
  }
  get requiredMoney(): HTMLDivElement {
    return this.query<HTMLDivElement>('#required-money', false);
  }
  get rewardMoney(): HTMLDivElement {
    return this.query<HTMLDivElement>('#reward-money', false);
  }
  get rewardSpell(): HTMLDivElement {
    return this.query<HTMLDivElement>('#rewardSpell', false);
  }
  get rewardItems(): HTMLDivElement {
    return this.query<HTMLDivElement>('#reward-items', false);
  }
  get rewardChoiceItems(): HTMLDivElement {
    return this.query<HTMLDivElement>('#reward-choice-items', false);
  }

  get descriptionText(): HTMLDivElement {
    return this.query<HTMLDivElement>('#description-text');
  }
  get progressText(): HTMLDivElement {
    return this.query<HTMLDivElement>('#progress-text');
  }
  get completionText(): HTMLDivElement {
    return this.query<HTMLDivElement>('#completion-text');
  }
  get objectiveToggle(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#objective-toggle');
  }
  get descriptionToggle(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#description-toggle');
  }
  get progressToggle(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#progress-toggle');
  }
  get completionToggle(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#completion-toggle');
  }

  expectCollapsed(element: HTMLElement): void {
    expect(this.queryInsideElement(element, 'i').classList.contains('fa-caret-right')).toBe(true);
  }
  expectNotCollapsed(element: HTMLElement): void {
    expect(this.queryInsideElement(element, 'i').classList.contains('fa-caret-down')).toBe(true);
  }

  getRaces(assert = true): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('#races', assert);
  }
}

describe('QuestPreviewComponent', () => {
  function createMockObject(partial: Partial<Class>, c: Class) {
    return Object.assign(new c(), partial);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), QuestPreviewComponent, TranslateTestingModule, QuestPreviewComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  function setup() {
    const service = TestBed.inject(QuestPreviewService);
    const model3DViewerService = TestBed.inject(Model3DViewerService);
    vi.spyOn(model3DViewerService, 'generateModels').mockReturnValue(new Promise((resolve) => resolve({ destroy: () => {} })));

    const valueChangesSubject = new Subject<void>();
    vi.spyOn(service, 'valueChanges$').mockReturnValue(valueChangesSubject.asObservable());

    const fixture: ComponentFixture<QuestPreviewComponent> = TestBed.createComponent(QuestPreviewComponent);
    const changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
    const component: QuestPreviewComponent = fixture.componentInstance;

    const page = new QuestPreviewComponentPage(fixture);

    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);

    return {
      fixture,
      component,
      service,
      page,
      mysqlQueryService,
      sqliteQueryService,
      changeDetectorRef,
      valueChangesSubject,
      model3DViewerService,
    };
  }

  it('ngOnInit should initialise services', async () => {
    const { service, page, changeDetectorRef } = setup();
    const initializeServicesSpy: MockInstance = vi.spyOn(service, 'initializeServices').mockImplementation(() => undefined);

    await page.whenStable();

    expect(initializeServicesSpy).toHaveBeenCalledExactlyOnceWith(changeDetectorRef);
    page.removeNativeElement();
  });

  it('should react to value changes', async () => {
    const { valueChangesSubject, page } = setup();
    await page.whenStable();

    valueChangesSubject.next();
    await page.whenStable();

    // placeholder expect (the coverage would fail if this test doesn't do its job)
    expect(valueChangesSubject).toBeTruthy();
    page.removeNativeElement();
  });

  it('should show title, level and required level', () => {
    const title = 'MyTitle';
    const level = '77';
    const minLevel = '75';
    const maxLevel = '80';
    const { fixture, service, page } = setup();
    vi.spyOn(service, 'title', 'get').mockReturnValue(title);
    vi.spyOn(service, 'level', 'get').mockReturnValue(level);
    vi.spyOn(service, 'minLevel', 'get').mockReturnValue(minLevel);
    vi.spyOn(service, 'maxLevel', 'get').mockReturnValue(maxLevel);

    fixture.detectChanges();

    expect(page.title.innerText).toContain(title);
    expect(page.level.innerText).toContain(level);
    expect(page.minLevel.innerText).toContain(`${minLevel} - ${maxLevel}`);
    page.removeNativeElement();
  });

  it('should show questStart and questEnd icons', async () => {
    const { service, page } = setup();
    vi.spyOn(service, 'periodicQuest', 'get').mockReturnValue('');
    vi.spyOn(service, 'creatureQueststarterList', 'get').mockReturnValue([{ id: 123, quest: 123 }]);
    vi.spyOn(service, 'creatureQuestenderList', 'get').mockReturnValue([{ id: 123, quest: 123 }]);

    await page.whenStable();

    expect(page.creatureQuestStartIcon.src).toContain('assets/img/quest/quest_start.gif');
    expect(page.creatureQuestEndIcon.src).toContain('assets/img/quest/quest_end.gif');
    page.removeNativeElement();
  });

  it('should show questStart and questEnd icons', async () => {
    const { service, page } = setup();
    vi.spyOn(service, 'periodicQuest', 'get').mockReturnValue('Daily');
    vi.spyOn(service, 'creatureQueststarterList', 'get').mockReturnValue([{ id: 123, quest: 123 }]);
    vi.spyOn(service, 'creatureQuestenderList', 'get').mockReturnValue([{ id: 123, quest: 123 }]);

    await page.whenStable();

    expect(page.creatureQuestStartIcon.src).toContain('assets/img/quest/quest_start_daily.gif');
    expect(page.creatureQuestEndIcon.src).toContain('assets/img/quest/quest_end_daily.gif');
    page.removeNativeElement();
  });

  it('should show questType', () => {
    const { fixture, service, page } = setup();
    const questTemplate = createMockObject({ QuestInfoID: 41 }, QuestTemplate);
    vi.spyOn(service, 'periodicQuest', 'get').mockReturnValue('Daily');
    vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);

    fixture.detectChanges();

    expect(page.questType.innerText).toContain('Daily');
    expect(page.questType.innerText).toContain('PvP');
    page.removeNativeElement();
  });

  it('should show showRaces', async () => {
    const { service, page } = setup();
    vi.spyOn(service, 'side', 'get').mockReturnValue('');
    vi.spyOn(service, 'races', 'get').mockReturnValue([2, 4]);

    await page.whenStable();

    expect(page.getRaces().innerText).toContain('Orc');
    expect(page.getRaces().innerText).toContain('Night Elf');
    page.removeNativeElement();
  });

  it('should show showRaces (side=Alliance)', async () => {
    const { service, page } = setup();
    vi.spyOn(service, 'side', 'get').mockReturnValue('Alliance');
    vi.spyOn(service, 'races', 'get').mockReturnValue([2, 4]);

    await page.whenStable();

    expect(page.getRaces(false)).toBeFalsy();
    page.removeNativeElement();
  });

  it('should show showClasses', () => {
    const { fixture, service, page } = setup();
    vi.spyOn(service, 'classes', 'get').mockReturnValue([2, 4]);

    fixture.detectChanges();

    expect(page.classes.innerText).toContain('Paladin');
    expect(page.classes.innerText).toContain('Rogue');
    page.removeNativeElement();
  });

  it('should show required skill', async () => {
    const { service, page } = setup();
    vi.spyOn(service, 'requiredSkill$', 'get').mockReturnValue(Promise.resolve('Jewelcrafting'));

    await page.whenStable();

    expect(page.requiredSkill.innerText).toContain('Jewelcrafting');
    page.removeNativeElement();
  });

  it('should show required skill [2]', async () => {
    const { service, page } = setup();
    vi.spyOn(service, 'requiredSkill$', 'get').mockReturnValue(Promise.resolve('Jewelcrafting'));
    const questTemplateAddon = createMockObject({ RequiredSkillPoints: 10 }, QuestTemplateAddon);
    vi.spyOn(service, 'questTemplateAddon', 'get').mockReturnValue(questTemplateAddon);

    await page.whenStable();

    expect(page.requiredSkill.innerText).toContain('(10)');
    page.removeNativeElement();
  });

  it('should show provided item (start item)', async () => {
    const { fixture, service, page } = setup();
    const mockStartItem = 123456;
    const mockStartItemName = 'Sword of AzerothCore';
    vi.spyOn(service, 'startItem', 'get').mockReturnValue(mockStartItem);
    vi.spyOn(service, 'startItemName$', 'get').mockReturnValue(Promise.resolve(mockStartItemName));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.providedItem.innerText).toContain(`[${mockStartItem}]`);
    expect(page.providedItem.innerText).toContain(mockStartItemName);
    page.removeNativeElement();
  });

  it('should show rewardXP', async () => {
    const { fixture, service, page } = setup();
    const questTemplate = createMockObject({ RewardXPDifficulty: 2, QuestLevel: 10 }, QuestTemplate);
    vi.spyOn(service, 'rewardXP$', 'get').mockReturnValue(Promise.resolve('200'));
    vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.rewardXP.innerText).toContain('200');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show RewardTalents', () => {
    const { fixture, page, service } = setup();
    const questTemplate = createMockObject({ RewardTalents: 2 }, QuestTemplate);
    vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);

    fixture.detectChanges();

    expect(page.rewardTalents.innerText).toContain('2 talent points');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show rewardReputations', () => {
    const { fixture, page, service } = setup();
    const RewardFactionValue1 = 1;
    const questTemplate = createMockObject({ RewardFactionID1: 72, RewardFactionValue1 }, QuestTemplate);
    vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);

    fixture.detectChanges();

    expect(page.rewardReputations.innerText).toContain(`${QUEST_FACTION_REWARD[RewardFactionValue1]}`);
    fixture.debugElement.nativeElement.remove();
  });

  it('should show areaDescription', () => {
    const { fixture, page, service } = setup();
    const questTemplate = createMockObject({ AreaDescription: 'Area Desc' }, QuestTemplate);
    vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);

    fixture.detectChanges();

    expect(page.areaDescription.innerText).toContain('Area Desc');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show npcOrGoObjectives', async () => {
    const { fixture, page, service } = setup();
    vi.spyOn(service, 'getObjectiveCount').mockReturnValue('(1)');
    vi.spyOn(service, 'getObjText').mockReturnValue('Mock Objective');
    vi.spyOn(service, 'getObjective$').mockReturnValue(Promise.resolve('Riverpaw Gnoll'));
    vi.spyOn(service, 'isNpcOrGoObj').mockReturnValue(true);

    await fixture.whenStable();

    expect(page.npcOrGoObjectives.innerText).toContain('Mock Objective (1)');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show npcOrGoObjectives [2]', async () => {
    const { fixture, page, service } = setup();
    const getObjectiveCountSpy: MockInstance = vi.spyOn(service, 'getObjectiveCount').mockReturnValue('(1)');
    vi.spyOn(service, 'getObjText').mockReturnValue('Mock Objective');
    vi.spyOn(service, 'getObjective$').mockReturnValue(Promise.resolve('Riverpaw Gnoll'));
    vi.spyOn(service, 'isNpcOrGoObj').mockReturnValue(true);
    getObjectiveCountSpy.mockReturnValue('');

    await fixture.whenStable();

    expect(page.npcOrGoObjectives.innerText).toContain('Mock Objective');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show itemObjectives', async () => {
    const { fixture, page, service, mysqlQueryService } = setup();
    const getObjItemCountSpy: MockInstance = vi.spyOn(service, 'getObjItemCount').mockReturnValue('(2)');
    const questTemplate = createMockObject({ RequiredItemId1: 1 }, QuestTemplate);
    vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
    vi.spyOn(mysqlQueryService, 'getItemNameById').mockReturnValue(Promise.resolve('Mock Item'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(page.itemObjectives.innerText).toContain('Mock Item (2)');

    getObjItemCountSpy.mockReturnValue('');

    fixture.detectChanges();
    expect(page.itemObjectives.innerText).toContain('Mock Item');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show RequiredFaction', async () => {
    const { fixture, page, service, sqliteQueryService } = setup();
    const questTemplate = createMockObject({ RequiredFactionId1: 1, RequiredFactionValue1: 900 }, QuestTemplate);
    vi.spyOn(service, 'getFactionByValue').mockReturnValue('(Neutral)');
    vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
    vi.spyOn(sqliteQueryService, 'getFactionNameById').mockReturnValue(Promise.resolve('Mock Faction'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(page.RequiredFaction.innerText).toContain('Mock Faction (Neutral)');

    fixture.debugElement.nativeElement.remove();
  });

  describe('description/progress/completion', () => {
    it('should contain the correct text', () => {
      const { fixture, service, page } = setup();
      const description = 'My description text';
      const progress = 'My progress text';
      const completion = 'My completion text';

      const questTemplate = createMockObject({ QuestDescription: description }, QuestTemplate);
      const questRequestItems = createMockObject({ CompletionText: progress }, QuestRequestItems);
      const questOfferReward = createMockObject({ RewardText: completion }, QuestOfferReward);

      vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
      vi.spyOn(service, 'questRequestItems', 'get').mockReturnValue(questRequestItems);
      vi.spyOn(service, 'questOfferReward', 'get').mockReturnValue(questOfferReward);

      fixture.detectChanges();

      expect(page.descriptionText.innerText).toContain(description);
      expect(page.progressText.innerText).toContain(progress);
      expect(page.completionText.innerText).toContain(completion);
      page.removeNativeElement();
    });

    it('should correctly toggle', () => {
      const { fixture, page } = setup();

      fixture.detectChanges();

      page.expectCollapsed(page.objectiveToggle);
      page.expectCollapsed(page.descriptionToggle);
      page.expectCollapsed(page.progressToggle);
      page.expectCollapsed(page.completionToggle);

      page.clickElement(page.objectiveToggle);
      page.expectNotCollapsed(page.objectiveToggle);

      page.clickElement(page.descriptionToggle);
      page.expectNotCollapsed(page.descriptionToggle);

      page.clickElement(page.progressToggle);
      page.expectNotCollapsed(page.progressToggle);

      page.clickElement(page.completionToggle);
      page.expectNotCollapsed(page.completionToggle);

      page.removeNativeElement();
    });

    it('should correctly show the required money', async () => {
      const { service, page } = setup();
      const spy = vi.spyOn(service, 'rewardMoney', 'get');
      spy.mockReturnValue(0);

      await page.whenStable();

      expect(page.requiredMoney).toBe(null as any);
      expect(page.rewardMoney).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the required money [2]', async () => {
      const { service, page } = setup();
      const spy = vi.spyOn(service, 'rewardMoney', 'get');
      spy.mockReturnValue(-123456);

      await page.whenStable();

      expect(page.requiredMoney).toBeDefined();
      expect(page.rewardMoney).toBe(null as any);
      expect(page.requiredMoney.innerHTML).toContain('<span class="moneygold">12</span>');
      expect(page.requiredMoney.innerHTML).toContain('<span class="moneysilver">34</span>');
      expect(page.requiredMoney.innerHTML).toContain('<span class="moneycopper">56</span>');

      page.removeNativeElement();
    });

    it('should correctly show the reward money', async () => {
      const { service, page } = setup();
      const spy = vi.spyOn(service, 'rewardMoney', 'get');
      spy.mockReturnValue(0);
      await page.whenStable();

      expect(page.rewardMoney).toBe(null as any);
      expect(page.requiredMoney).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the reward money [2]', async () => {
      const { service, page } = setup();
      const spy = vi.spyOn(service, 'rewardMoney', 'get');

      spy.mockReturnValue(123456);
      await page.whenStable();

      expect(page.rewardMoney).toBeDefined();
      expect(page.requiredMoney).toBe(null as any);
      expect(page.rewardMoney.innerHTML).toContain('<span class="moneygold">12</span>');
      expect(page.rewardMoney.innerHTML).toContain('<span class="moneysilver">34</span>');
      expect(page.rewardMoney.innerHTML).toContain('<span class="moneycopper">56</span>');

      page.removeNativeElement();
    });

    it('should correctly show the reward spell', async () => {
      const { service, page, sqliteQueryService } = setup();
      const rewardSpellSpy = vi.spyOn(service, 'rewardSpell').mockImplementation(() => undefined);
      const questTemplate = createMockObject({ rewardSpell: 123 }, QuestTemplate);
      vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
      vi.spyOn(sqliteQueryService, 'getSpellNameById').mockReturnValue(Promise.resolve('Mock Spell'));

      rewardSpellSpy.mockReturnValue(null);
      await page.whenStable();

      expect(page.rewardSpell).toBeNull();
      page.removeNativeElement();
    });

    it('should correctly show the reward spell [2]', async () => {
      const { service, page, sqliteQueryService } = setup();
      const rewardSpellSpy = vi.spyOn(service, 'rewardSpell').mockImplementation(() => undefined);
      const questTemplate = createMockObject({ rewardSpell: 123 }, QuestTemplate);
      vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
      vi.spyOn(sqliteQueryService, 'getSpellNameById').mockReturnValue(Promise.resolve('Mock Spell'));
      rewardSpellSpy.mockReturnValue(123);

      await page.whenStable();

      expect(page.rewardSpell).toBeDefined();
      expect(page.rewardSpell.innerText).toContain('You will learn:');
      expect(page.rewardSpell.innerText).toContain('Mock Spell');

      page.removeNativeElement();
    });

    it('should correctly show the reward items', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardItemsSpy = vi.spyOn(service, 'isRewardItems').mockImplementation(() => undefined);
      const questTemplate = createMockObject({ RewardItem1: 123, RewardAmount1: 1 }, QuestTemplate);
      vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
      vi.spyOn(mysqlQueryService, 'getItemNameById').mockReturnValue(Promise.resolve('Mock Item'));

      isRewardItemsSpy.mockReturnValue(false);
      await page.whenStable();

      expect(page.rewardItems).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the reward item [2]', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardItemsSpy = vi.spyOn(service, 'isRewardItems').mockImplementation(() => undefined);
      const questTemplate = createMockObject({ RewardItem1: 123, RewardAmount1: 1 }, QuestTemplate);
      vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
      vi.spyOn(mysqlQueryService, 'getItemNameById').mockReturnValue(Promise.resolve('Mock Item'));
      isRewardItemsSpy.mockReturnValue(true);

      await page.whenStable();

      expect(page.rewardItems).toBeDefined();
      expect(page.rewardItems.innerText).toContain('You will receive:');
      expect(page.rewardItems.innerText).toContain('Mock Item');

      page.removeNativeElement();
    });

    it('should correctly show the reward choice items', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardChoiceItemsSpy = vi.spyOn(service, 'isRewardChoiceItems').mockImplementation(() => undefined);
      const questTemplate = createMockObject({ RewardChoiceItemID1: 123, RewardChoiceItemQuantity1: 1 }, QuestTemplate);
      vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
      vi.spyOn(mysqlQueryService, 'getItemNameById').mockReturnValue(Promise.resolve('Mock Item'));

      isRewardChoiceItemsSpy.mockReturnValue(false);
      await page.whenStable();

      expect(page.rewardChoiceItems).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the reward choice items [2]', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardChoiceItemsSpy = vi.spyOn(service, 'isRewardChoiceItems').mockImplementation(() => undefined);
      const questTemplate = createMockObject({ RewardChoiceItemID1: 123, RewardChoiceItemQuantity1: 1 }, QuestTemplate);
      vi.spyOn(service, 'questTemplate', 'get').mockReturnValue(questTemplate);
      vi.spyOn(mysqlQueryService, 'getItemNameById').mockReturnValue(Promise.resolve('Mock Item'));
      isRewardChoiceItemsSpy.mockReturnValue(true);

      await page.whenStable();

      expect(page.rewardChoiceItems).toBeDefined();
      expect(page.rewardChoiceItems.innerText).toContain('You will be able to choose one of these rewards');
      expect(page.rewardChoiceItems.innerText).toContain('Mock Item');

      page.removeNativeElement();
    });
  });
});
