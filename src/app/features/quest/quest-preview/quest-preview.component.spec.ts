import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import Spy = jasmine.Spy;

import { QuestPreviewComponent } from './quest-preview.component';
import { QuestModule } from '../quest.module';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestPreviewService } from './quest-preview.service';
import { PageObject } from '@keira-shared/testing/page-object';
import { QuestTemplateService } from '../quest-template/quest-template.service';
import { QuestTemplateAddonService } from '../quest-template-addon/quest-template-addon.service';

class QuestPreviewComponentPage extends PageObject<QuestPreviewComponent> {
  get title() { return this.query<HTMLHeadElement>('#title'); }
  get level() { return this.query<HTMLParagraphElement>('#level'); }
  get minLevel() { return this.query<HTMLParagraphElement>('#minlevel'); }
  get startIcon() { return this.query<HTMLImageElement>('#questStartIcon'); }
  get endIcon() { return this.query<HTMLImageElement>('#questEndIcon'); }
  get questType() { return this.query<HTMLParagraphElement>('#type'); }
  get races() { return this.query<HTMLParagraphElement>('#races'); }
  get classes() { return this.query<HTMLParagraphElement>('#classes'); }
  get requiredSkill() { return this.query<HTMLParagraphElement>('#requiredSkill'); }
  get racesElement() { return this.fixture.nativeElement.querySelector('#races'); }
  get rewardXP() { return this.query<HTMLParagraphElement>('#rewardXP'); }
  get rewardTalents() { return this.query<HTMLParagraphElement>('#rewardTalents'); }
  get rewardReputations() { return this.query<HTMLParagraphElement>('#rewardReputations'); }
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
    const questTemplateService = TestBed.inject(QuestTemplateService);
    const questTemplateAddonService = TestBed.inject(QuestTemplateAddonService);
    const fixture: ComponentFixture<QuestPreviewComponent> = TestBed.createComponent(QuestPreviewComponent);
    const component: QuestPreviewComponent = fixture.componentInstance;
    const page = new QuestPreviewComponentPage(fixture);

    return { fixture, component, service, page, questTemplateService, questTemplateAddonService };
  }

  it('ngOnInit should initialise services', () => {
    const { fixture, service } = setup();
    const initializeServicesSpy: Spy = spyOn(service, 'initializeServices');

    fixture.detectChanges();

    expect(initializeServicesSpy).toHaveBeenCalledTimes(1);
    fixture.debugElement.nativeElement.remove();
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
    fixture.debugElement.nativeElement.remove();
  });

  it('should show questStart and questEnd icons', () => {
    const { fixture, service, page } = setup();
    const periodicQuestSpy = spyOnProperty(service, 'periodicQuest', 'get').and.returnValue('');
    spyOnProperty(service, 'creatureQueststarterList', 'get').and.returnValue([{ id: 123, quest: 123 }]);
    spyOnProperty(service, 'creatureQuestenderList', 'get').and.returnValue([{ id: 123, quest: 123 }]);

    fixture.detectChanges();

    expect(page.startIcon.src).toContain('assets/img/quest/quest_start.gif');
    expect(page.endIcon.src).toContain('assets/img/quest/quest_end.gif');

    periodicQuestSpy.and.returnValue('Daily');

    fixture.detectChanges();

    expect(page.startIcon.src).toContain('assets/img/quest/quest_start_daily.gif');
    expect(page.endIcon.src).toContain('assets/img/quest/quest_end_daily.gif');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show questType', () => {
    const { fixture, service, page, questTemplateService } = setup();
    spyOnProperty(service, 'periodicQuest', 'get').and.returnValue('Daily');
    questTemplateService.form.controls.QuestInfoID.setValue(41);

    fixture.detectChanges();

    expect(page.questType.innerText).toContain('Daily');
    expect(page.questType.innerText).toContain('PvP');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show showRaces', () => {
    const { fixture, service, page } = setup();
    const sideSpy = spyOnProperty(service, 'side', 'get').and.returnValue('');
    spyOnProperty(service, 'races', 'get').and.returnValue([2, 4]);

    fixture.detectChanges();

    expect(page.races.innerText).toContain('Orc');
    expect(page.races.innerText).toContain('Night Elf');

    // in case of "Side"
    sideSpy.and.returnValue('Alliance');
    fixture.detectChanges();
    expect(page.racesElement).toBeFalsy();

    fixture.debugElement.nativeElement.remove();
  });

  it('should show showClasses', () => {
    const { fixture, service, page } = setup();
    spyOnProperty(service, 'classes', 'get').and.returnValue([2, 4]);

    fixture.detectChanges();

    expect(page.classes.innerText).toContain('Paladin');
    expect(page.classes.innerText).toContain('Rogue');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show required skill', async() => {
    const { fixture, service, page, questTemplateAddonService } = setup();
    spyOnProperty(service, 'requiredSkill$', 'get').and.returnValue(Promise.resolve('Jewelcrafting'));
    questTemplateAddonService.form.controls.RequiredSkillID.setValue(755);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.requiredSkill.innerText).toContain('Jewelcrafting');

    questTemplateAddonService.form.controls.RequiredSkillPoints.setValue(10);
    fixture.detectChanges();
    expect(page.requiredSkill.innerText).toContain('(10)');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show rewardXP', async() => {
    const { fixture, service, page, questTemplateService } = setup();
    spyOnProperty(service, 'rewardXP$', 'get').and.returnValue(Promise.resolve('200'));
    questTemplateService.form.controls.RewardXPDifficulty.setValue(2);
    questTemplateService.form.controls.QuestLevel.setValue(10);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.rewardXP.innerText).toContain('200');

    fixture.debugElement.nativeElement.remove();
  });

  it('should show RewardTalents', () => {
    const { fixture, page, questTemplateService } = setup();
    questTemplateService.form.controls.RewardTalents.setValue(2);

    fixture.detectChanges();

    expect(page.rewardTalents.innerText).toContain('2 talent points');
    fixture.debugElement.nativeElement.remove();
  });

  it('should show rewardReputations', () => {
    const { fixture, page, questTemplateService } = setup();
    questTemplateService.form.controls.RewardFactionID1.setValue(72);
    questTemplateService.form.controls.RewardFactionValue1.setValue(123);

    fixture.detectChanges();

    expect(page.rewardReputations.innerText).toContain('123');
    fixture.debugElement.nativeElement.remove();
  });

});
