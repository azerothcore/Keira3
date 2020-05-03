import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import Spy = jasmine.Spy;

import { QuestPreviewComponent } from './quest-preview.component';
import { QuestModule } from '../quest.module';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestPreviewService } from './quest-preview.service';
import { PageObject } from '@keira-shared/testing/page-object';
import { QuestTemplate } from '@keira-shared/types/quest-template.type';
import { QuestTemplateAddon } from '@keira-shared/types/quest-template-addon.type';
import { createMockObject } from '@keira-shared/utils/helpers';

class QuestPreviewComponentPage extends PageObject<QuestPreviewComponent> {
  get title() { return this.query<HTMLHeadElement>('#title'); }
  get level() { return this.query<HTMLParagraphElement>('#level'); }
  get minLevel() { return this.query<HTMLParagraphElement>('#minlevel'); }
  get creatureQuestStartIcon() { return this.query<HTMLImageElement>('#creatureQuestStartIcon'); }
  get creatureQuestEndIcon() { return this.query<HTMLImageElement>('#creatureQuestEndIcon'); }
  get questType() { return this.query<HTMLParagraphElement>('#type'); }
  get classes() { return this.query<HTMLParagraphElement>('#classes'); }
  get requiredSkill() { return this.query<HTMLParagraphElement>('#requiredSkill'); }
  get rewardXP() { return this.query<HTMLParagraphElement>('#rewardXP'); }
  get rewardTalents() { return this.query<HTMLParagraphElement>('#rewardTalents'); }
  get rewardReputations() { return this.query<HTMLParagraphElement>('#rewardReputations'); }
  get providedItem() { return this.query<HTMLParagraphElement>('#provided-item'); }

  getRaces(assert = true) { return this.query<HTMLParagraphElement>('#races', assert); }
}

describe('QuestPreviewComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestPreviewComponent ],
      imports: [
        RouterTestingModule,
        QuestModule,
      ],
    })
    .compileComponents();
  }));

  function setup() {
    const service = TestBed.inject(QuestPreviewService);
    const fixture: ComponentFixture<QuestPreviewComponent> = TestBed.createComponent(QuestPreviewComponent);
    const component: QuestPreviewComponent = fixture.componentInstance;
    const page = new QuestPreviewComponentPage(fixture);

    return { fixture, component, service, page };
  }

  it('ngOnInit should initialise services', () => {
    const { fixture, service, page } = setup();
    const initializeServicesSpy: Spy = spyOn(service, 'initializeServices');

    fixture.detectChanges();

    expect(initializeServicesSpy).toHaveBeenCalledTimes(1);
    page.removeElement();
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
    page.removeElement();
  });

  it('should show questStart and questEnd icons', () => {
    const { fixture, service, page } = setup();
    const periodicQuestSpy = spyOnProperty(service, 'periodicQuest', 'get').and.returnValue('');
    spyOnProperty(service, 'creatureQueststarterList', 'get').and.returnValue([{ id: 123, quest: 123 }]);
    spyOnProperty(service, 'creatureQuestenderList', 'get').and.returnValue([{ id: 123, quest: 123 }]);

    fixture.detectChanges();

    expect(page.creatureQuestStartIcon.src).toContain('assets/img/quest/quest_start.gif');
    expect(page.creatureQuestEndIcon.src).toContain('assets/img/quest/quest_end.gif');

    periodicQuestSpy.and.returnValue('Daily');

    fixture.detectChanges();

    expect(page.creatureQuestStartIcon.src).toContain('assets/img/quest/quest_start_daily.gif');
    expect(page.creatureQuestEndIcon.src).toContain('assets/img/quest/quest_end_daily.gif');
    page.removeElement();
  });

  it('should show questType', () => {
    const { fixture, service, page } = setup();
    const questTemplate = createMockObject({ QuestInfoID: 41 }, QuestTemplate);
    spyOnProperty(service, 'periodicQuest', 'get').and.returnValue('Daily');
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);

    fixture.detectChanges();

    expect(page.questType.innerText).toContain('Daily');
    expect(page.questType.innerText).toContain('PvP');
    page.removeElement();
  });

  it('should show showRaces', () => {
    const { fixture, service, page } = setup();
    const sideSpy = spyOnProperty(service, 'side', 'get').and.returnValue('');
    spyOnProperty(service, 'races', 'get').and.returnValue([2, 4]);

    fixture.detectChanges();

    expect(page.getRaces().innerText).toContain('Orc');
    expect(page.getRaces().innerText).toContain('Night Elf');

    // in case of "Side"
    sideSpy.and.returnValue('Alliance');
    fixture.detectChanges();
    expect(page.getRaces(false)).toBeFalsy();
    page.removeElement();
  });

  it('should show showClasses', () => {
    const { fixture, service, page } = setup();
    spyOnProperty(service, 'classes', 'get').and.returnValue([2, 4]);

    fixture.detectChanges();

    expect(page.classes.innerText).toContain('Paladin');
    expect(page.classes.innerText).toContain('Rogue');
    page.removeElement();
  });

  it('should show required skill', async() => {
    const { fixture, service, page } = setup();
    spyOnProperty(service, 'requiredSkill$', 'get').and.returnValue(Promise.resolve('Jewelcrafting'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.requiredSkill.innerText).toContain('Jewelcrafting');

    const questTemplateAddon = createMockObject({ RequiredSkillPoints: 10 }, QuestTemplateAddon);
    spyOnProperty(service, 'questTemplateAddon', 'get').and.returnValue(questTemplateAddon);

    fixture.detectChanges();
    expect(page.requiredSkill.innerText).toContain('(10)');
    page.removeElement();
  });

  it('should show provided item (start item)', async() => {
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
    page.removeElement();
  });

  it('should show rewardXP', async() => {
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
    const questTemplate = createMockObject({ RewardFactionID1: 72, RewardFactionValue1: 123 }, QuestTemplate);
    spyOnProperty(service, 'questTemplate', 'get').and.returnValue(questTemplate);

    fixture.detectChanges();

    expect(page.rewardReputations.innerText).toContain('123');
    fixture.debugElement.nativeElement.remove();
  });

});
