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
import Spy = jasmine.Spy;

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
    expect(this.queryInsideElement(element, 'i')).toHaveClass('fa-caret-right');
  }
  expectNotCollapsed(element: HTMLElement): void {
    expect(this.queryInsideElement(element, 'i')).toHaveClass('fa-caret-down');
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
    spyOn(model3DViewerService, 'generateModels').and.returnValue(new Promise((resolve) => resolve({ destroy: () => {} })));

    const valueChangesSubject = new Subject<void>();
    spyOn(service, 'valueChanges$').and.returnValue(valueChangesSubject.asObservable());

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
    const initializeServicesSpy: Spy = spyOn(service, 'initializeServices');

    await page.whenStable();

    expect(initializeServicesSpy).toHaveBeenCalledOnceWith(changeDetectorRef);
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
    spyOnProperty(service, 'title', 'get').and.returnValue(title);
    spyOnProperty(service, 'level', 'get').and.returnValue(level);
    spyOnProperty(service, 'minLevel', 'get').and.returnValue(minLevel);
    spyOnProperty(service, 'maxLevel', 'get').and.returnValue(maxLevel);

    fixture.detectChanges();

    expect(page.title.innerText).toContain(title);
    expect(page.level.innerText).toContain(level);
    expect(page.minLevel.innerText).toContain(`${minLevel} - ${maxLevel}`);
    page.removeNativeElement();
  });

  it('should show questStart and questEnd icons', async () => {
    const { service, page } = setup();
    spyOnProperty(service, 'periodicQuest', 'get').and.returnValue('');
    spyOnProperty(service, 'creatureQueststarterList', 'get').and.returnValue([{ id: 123, quest: 123 }]);
    spyOnProperty(service, 'creatureQuestenderList', 'get').and.returnValue([{ id: 123, quest: 123 }]);

    await page.whenStable();

    expect(page.creatureQuestStartIcon.src).toContain('assets/img/quest/quest_start.gif');
    expect(page.creatureQuestEndIcon.src).toContain('assets/img/quest/quest_end.gif');
    page.removeNativeElement();
  });

  it('should show questStart and questEnd icons', async () => {
    const { service, page } = setup();
    spyOnProperty(service, 'periodicQuest', 'get').and.returnValue('Daily');
    spyOnProperty(service, 'creatureQueststarterList', 'get').and.returnValue([{ id: 123, quest: 123 }]);
    spyOnProperty(service, 'creatureQuestenderList', 'get').and.returnValue([{ id: 123, quest: 123 }]);

    await page.whenStable();

    expect(page.creatureQuestStartIcon.src).toContain('assets/img/quest/quest_start_daily.gif');
    expect(page.creatureQuestEndIcon.src).toContain('assets/img/quest/quest_end_daily.gif');
    page.removeNativeElement();
  });

  it('should show questType', () => {
    const { fixture, service, page } = setup();
    const questTemplate = createMockObject({ QuestInfoID: 41 }, QuestTemplate);
    spyOnProperty(service, 'periodicQuest', 'get').and.returnValue('Daily');
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);

    fixture.detectChanges();

    expect(page.questType.innerText).toContain('Daily');
    expect(page.questType.innerText).toContain('PvP');
    page.removeNativeElement();
  });

  it('should show showRaces', async () => {
    const { service, page } = setup();
    spyOnProperty(service, 'side', 'get').and.returnValue('');
    spyOnProperty(service, 'races', 'get').and.returnValue([2, 4]);

    await page.whenStable();

    expect(page.getRaces().innerText).toContain('Orc');
    expect(page.getRaces().innerText).toContain('Night Elf');
    page.removeNativeElement();
  });

  it('should show showRaces (side=Alliance)', async () => {
    const { service, page } = setup();
    spyOnProperty(service, 'side', 'get').and.returnValue('Alliance');
    spyOnProperty(service, 'races', 'get').and.returnValue([2, 4]);

    await page.whenStable();

    expect(page.getRaces(false)).toBeFalsy();
    page.removeNativeElement();
  });

  it('should show showClasses', () => {
    const { fixture, service, page } = setup();
    spyOnProperty(service, 'classes', 'get').and.returnValue([2, 4]);

    fixture.detectChanges();

    expect(page.classes.innerText).toContain('Paladin');
    expect(page.classes.innerText).toContain('Rogue');
    page.removeNativeElement();
  });

  it('should show required skill', async () => {
    const { service, page } = setup();
    spyOnProperty(service, 'requiredSkill$', 'get').and.returnValue(Promise.resolve('Jewelcrafting'));

    await page.whenStable();

    expect(page.requiredSkill.innerText).toContain('Jewelcrafting');
    page.removeNativeElement();
  });

  it('should show required skill [2]', async () => {
    const { service, page } = setup();
    spyOnProperty(service, 'requiredSkill$', 'get').and.returnValue(Promise.resolve('Jewelcrafting'));
    const questTemplateAddon = createMockObject({ RequiredSkillPoints: 10 }, QuestTemplateAddon);
    spyOnProperty(service, 'questTemplateAddon', 'get').and.returnValue(questTemplateAddon);

    await page.whenStable();

    expect(page.requiredSkill.innerText).toContain('(10)');
    page.removeNativeElement();
  });

  it('should show provided item (start item)', async () => {
    const { fixture, service, page } = setup();
    const mockStartItem = 123456;
    const mockStartItemName = 'Sword of AzerothCore';
    spyOnProperty(service, 'startItem', 'get').and.returnValue(mockStartItem);
    spyOnProperty(service, 'startItemName$', 'get').and.returnValue(Promise.resolve(mockStartItemName));

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
    spyOnProperty(service, 'rewardXP$', 'get').and.returnValue(Promise.resolve('200'));
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.rewardXP.innerText).toContain('200');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show RewardTalents', () => {
    const { fixture, page, service } = setup();
    const questTemplate = createMockObject({ RewardTalents: 2 }, QuestTemplate);
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);

    fixture.detectChanges();

    expect(page.rewardTalents.innerText).toContain('2 talent points');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show rewardReputations', () => {
    const { fixture, page, service } = setup();
    const RewardFactionValue1 = 1;
    const questTemplate = createMockObject({ RewardFactionID1: 72, RewardFactionValue1 }, QuestTemplate);
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);

    fixture.detectChanges();

    expect(page.rewardReputations.innerText).toContain(`${QUEST_FACTION_REWARD[RewardFactionValue1]}`);
    fixture.debugElement.nativeElement.remove();
  });

  it('should show areaDescription', () => {
    const { fixture, page, service } = setup();
    const questTemplate = createMockObject({ AreaDescription: 'Area Desc' }, QuestTemplate);
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);

    fixture.detectChanges();

    expect(page.areaDescription.innerText).toContain('Area Desc');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show npcOrGoObjectives', async () => {
    const { fixture, page, service } = setup();
    spyOn(service, 'getObjectiveCount').and.returnValue('(1)');
    spyOn(service, 'getObjText').and.returnValue('Mock Objective');
    spyOn(service, 'getObjective$').and.returnValue(Promise.resolve('Riverpaw Gnoll'));
    spyOn(service, 'isNpcOrGoObj').and.returnValue(true);

    await fixture.whenStable();

    expect(page.npcOrGoObjectives.innerText).toContain('Mock Objective (1)');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show npcOrGoObjectives [2]', async () => {
    const { fixture, page, service } = setup();
    const getObjectiveCountSpy: Spy = spyOn(service, 'getObjectiveCount').and.returnValue('(1)');
    spyOn(service, 'getObjText').and.returnValue('Mock Objective');
    spyOn(service, 'getObjective$').and.returnValue(Promise.resolve('Riverpaw Gnoll'));
    spyOn(service, 'isNpcOrGoObj').and.returnValue(true);
    getObjectiveCountSpy.and.returnValue('');

    await fixture.whenStable();

    expect(page.npcOrGoObjectives.innerText).toContain('Mock Objective');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show itemObjectives', async () => {
    const { fixture, page, service, mysqlQueryService } = setup();
    const getObjItemCountSpy: Spy = spyOn(service, 'getObjItemCount').and.returnValue('(2)');
    const questTemplate = createMockObject({ RequiredItemId1: 1 }, QuestTemplate);
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
    spyOn(mysqlQueryService, 'getItemNameById').and.returnValue(Promise.resolve('Mock Item'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(page.itemObjectives.innerText).toContain('Mock Item (2)');

    getObjItemCountSpy.and.returnValue('');

    fixture.detectChanges();
    expect(page.itemObjectives.innerText).toContain('Mock Item');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show RequiredFaction', async () => {
    const { fixture, page, service, sqliteQueryService } = setup();
    const questTemplate = createMockObject({ RequiredFactionId1: 1, RequiredFactionValue1: 900 }, QuestTemplate);
    spyOn(service, 'getFactionByValue').and.returnValue('(Neutral)');
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
    spyOn(sqliteQueryService, 'getFactionNameById').and.returnValue(Promise.resolve('Mock Faction'));

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

      spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
      spyOnProperty(service, 'questRequestItems', 'get').and.returnValue(questRequestItems);
      spyOnProperty(service, 'questOfferReward', 'get').and.returnValue(questOfferReward);

      fixture.detectChanges();

      expect(page.descriptionText.innerText).toContain(description);
      expect(page.progressText.innerText).toContain(progress);
      expect(page.completionText.innerText).toContain(completion);
      page.removeNativeElement();
    });

    it('should correctly toggle', () => {
      const { fixture, page } = setup();

      fixture.detectChanges();

      page.expectCollapsed(page.descriptionToggle);
      page.expectCollapsed(page.progressToggle);
      page.expectCollapsed(page.completionToggle);

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
      const spy = spyOnProperty(service, 'rewardMoney', 'get');
      spy.and.returnValue(0);

      await page.whenStable();

      expect(page.requiredMoney).toBe(null as any);
      expect(page.rewardMoney).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the required money [2]', async () => {
      const { service, page } = setup();
      const spy = spyOnProperty(service, 'rewardMoney', 'get');
      spy.and.returnValue(-123456);

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
      const spy = spyOnProperty(service, 'rewardMoney', 'get');
      spy.and.returnValue(0);
      await page.whenStable();

      expect(page.rewardMoney).toBe(null as any);
      expect(page.requiredMoney).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the reward money [2]', async () => {
      const { service, page } = setup();
      const spy = spyOnProperty(service, 'rewardMoney', 'get');

      spy.and.returnValue(123456);
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
      const rewardSpellSpy = spyOn(service, 'rewardSpell');
      const questTemplate = createMockObject({ rewardSpell: 123 }, QuestTemplate);
      spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
      spyOn(sqliteQueryService, 'getSpellNameById').and.returnValue(Promise.resolve('Mock Spell'));

      rewardSpellSpy.and.returnValue(null);
      await page.whenStable();

      expect(page.rewardSpell).toBeNull();
      page.removeNativeElement();
    });

    it('should correctly show the reward spell [2]', async () => {
      const { service, page, sqliteQueryService } = setup();
      const rewardSpellSpy = spyOn(service, 'rewardSpell');
      const questTemplate = createMockObject({ rewardSpell: 123 }, QuestTemplate);
      spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
      spyOn(sqliteQueryService, 'getSpellNameById').and.returnValue(Promise.resolve('Mock Spell'));
      rewardSpellSpy.and.returnValue(123);

      await page.whenStable();

      expect(page.rewardSpell).toBeDefined();
      expect(page.rewardSpell.innerText).toContain('You will learn:');
      expect(page.rewardSpell.innerText).toContain('Mock Spell');

      page.removeNativeElement();
    });

    it('should correctly show the reward items', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardItemsSpy = spyOn(service, 'isRewardItems');
      const questTemplate = createMockObject({ RewardItem1: 123, RewardAmount1: 1 }, QuestTemplate);
      spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
      spyOn(mysqlQueryService, 'getItemNameById').and.returnValue(Promise.resolve('Mock Item'));

      isRewardItemsSpy.and.returnValue(false);
      await page.whenStable();

      expect(page.rewardItems).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the reward item [2]', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardItemsSpy = spyOn(service, 'isRewardItems');
      const questTemplate = createMockObject({ RewardItem1: 123, RewardAmount1: 1 }, QuestTemplate);
      spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
      spyOn(mysqlQueryService, 'getItemNameById').and.returnValue(Promise.resolve('Mock Item'));
      isRewardItemsSpy.and.returnValue(true);

      await page.whenStable();

      expect(page.rewardItems).toBeDefined();
      expect(page.rewardItems.innerText).toContain('You will receive:');
      expect(page.rewardItems.innerText).toContain('Mock Item');

      page.removeNativeElement();
    });

    it('should correctly show the reward choice items', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardChoiceItemsSpy = spyOn(service, 'isRewardChoiceItems');
      const questTemplate = createMockObject({ RewardChoiceItemID1: 123, RewardChoiceItemQuantity1: 1 }, QuestTemplate);
      spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
      spyOn(mysqlQueryService, 'getItemNameById').and.returnValue(Promise.resolve('Mock Item'));

      isRewardChoiceItemsSpy.and.returnValue(false);
      await page.whenStable();

      expect(page.rewardChoiceItems).toBe(null as any);
      page.removeNativeElement();
    });

    it('should correctly show the reward choice items [2]', async () => {
      const { service, page, mysqlQueryService } = setup();
      const isRewardChoiceItemsSpy = spyOn(service, 'isRewardChoiceItems');
      const questTemplate = createMockObject({ RewardChoiceItemID1: 123, RewardChoiceItemQuantity1: 1 }, QuestTemplate);
      spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);
      spyOn(mysqlQueryService, 'getItemNameById').and.returnValue(Promise.resolve('Mock Item'));
      isRewardChoiceItemsSpy.and.returnValue(true);

      await page.whenStable();

      expect(page.rewardChoiceItems).toBeDefined();
      expect(page.rewardChoiceItems.innerText).toContain('You will be able to choose one of these rewards');
      expect(page.rewardChoiceItems.innerText).toContain('Mock Item');

      page.removeNativeElement();
    });
  });
});
