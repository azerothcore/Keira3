import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestTemplateService } from '../quest-template/quest-template.service';
import { QuestModule } from '../quest.module';
import { QuestPreviewService } from './quest-preview.service';
import Spy = jasmine.Spy;

describe('QuestPreviewService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        QuestModule,
      ],
      providers: [
        QuestTemplateService,
      ]
    });
  });

  const setup = () => {
    const service = TestBed.inject(QuestPreviewService);
    const questTemplateService = TestBed.inject(QuestTemplateService);

    return { service, questTemplateService };
  };

  it('handle questTemplate values', () => {
    const { service, questTemplateService } = setup();

    const mockTitle = 'Test';
    const questLevel = 80;
    const minLevel = 10;
    const mockRaces = 123;

    questTemplateService.form.controls.LogTitle.setValue(mockTitle);
    questTemplateService.form.controls.QuestLevel.setValue(questLevel);
    questTemplateService.form.controls.MinLevel.setValue(minLevel);
    questTemplateService.form.controls.AllowableRaces.setValue(mockRaces);

    expect(service.title).toBe(mockTitle);
    expect(service.level).toBe(String(questLevel));
    expect(service.minLevel).toBe(String(minLevel));
    expect(service.side).toBeNull();
    expect(service.races).toBe('Human,Orc,Night Elf,Undead,Tauren,Gnome');

    questTemplateService.form.controls.AllowableRaces.setValue(null);
    expect(service.races).toBeUndefined();

    // check if quest is sharable
    questTemplateService.form.controls.Flags.setValue(8);
    expect(service.sharable).toBe('Sharable');

    questTemplateService.form.controls.Flags.setValue(4);
    expect(service.sharable).toBe('Not sharable');
  });

  it('initializeService', () => {
    const { service, questTemplateService } = setup();
    const initServiceSpy: Spy = spyOn<any>(service, 'initService').and.callThrough();
    const questTemplateLoadReloadSpy: Spy = spyOn(service['questTemplate'], 'reload');
    const questRequestItemLoadReloadSpy: Spy = spyOn(service['questRequestItem'], 'reload');
    const questTemplateAddonLoadReloadSpy: Spy = spyOn(service['questTemplateAddon'], 'reload');
    const gameObjectQueststarterLoadReloadSpy: Spy = spyOn(service['gameObjectQueststarter'], 'reload');
    const gameObjectQuestenderLoadReloadSpy: Spy = spyOn(service['gameObjectQuestender'], 'reload');
    const creatureQueststarterLoadReloadSpy: Spy = spyOn(service['creatureQueststarter'], 'reload');
    const creatureQuestenderLoadReloadSpy: Spy = spyOn(service['creatureQuestender'], 'reload');
    const mockEntity = '123';

    questTemplateService['_loadedEntityId'] = mockEntity;
    service['questHandler']['_selected'] = mockEntity;

    service.initializeServices();

    expect(initServiceSpy).toHaveBeenCalledWith(service['questTemplate']);
    expect(initServiceSpy).toHaveBeenCalledWith(service['questRequestItem']);
    expect(initServiceSpy).toHaveBeenCalledWith(service['questTemplateAddon']);
    expect(initServiceSpy).toHaveBeenCalledWith(service['gameObjectQueststarter']);
    expect(initServiceSpy).toHaveBeenCalledWith(service['gameObjectQuestender']);
    expect(initServiceSpy).toHaveBeenCalledWith(service['creatureQueststarter']);
    expect(initServiceSpy).toHaveBeenCalledWith(service['creatureQuestender']);
    expect(initServiceSpy).toHaveBeenCalledTimes(7);

    // initService
    expect(questTemplateLoadReloadSpy).toHaveBeenCalledTimes(0);
    expect(questRequestItemLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(questTemplateAddonLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(gameObjectQueststarterLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(gameObjectQuestenderLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(creatureQueststarterLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(creatureQuestenderLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(questTemplateLoadReloadSpy).not.toHaveBeenCalledWith(mockEntity);
    expect(questRequestItemLoadReloadSpy).toHaveBeenCalledWith(mockEntity);
    expect(questTemplateAddonLoadReloadSpy).toHaveBeenCalledWith(mockEntity);
    expect(gameObjectQueststarterLoadReloadSpy).toHaveBeenCalledWith(mockEntity);
    expect(gameObjectQuestenderLoadReloadSpy).toHaveBeenCalledWith(mockEntity);
    expect(creatureQueststarterLoadReloadSpy).toHaveBeenCalledWith(mockEntity);
    expect(creatureQuestenderLoadReloadSpy).toHaveBeenCalledWith(mockEntity);
  });
});
