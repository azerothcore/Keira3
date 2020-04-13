import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestTemplateService } from '../quest-template/quest-template.service';
import { QuestModule } from '../quest.module';
import { QuestPreviewService } from './quest-preview.service';
import Spy = jasmine.Spy;
import { QuestRequestItemsService } from '../quest-request-items/quest-request-items.service';
import { QuestTemplateAddonService } from '../quest-template-addon/quest-template-addon.service';
import { GameobjectQueststarterService } from '../gameobject-queststarter/gameobject-queststarter.service';
import { GameobjectQuestenderService } from '../gameobject-questender/gameobject-questender.service';
import { CreatureQueststarterService } from '../creature-queststarter/creature-queststarter.service';
import { CreatureQuestenderService } from '../creature-questender/creature-questender.service';
import { QuestHandlerService } from '../quest-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { of } from 'rxjs';

fdescribe('QuestPreviewService', () => {

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
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    const questTemplateService = TestBed.inject(QuestTemplateService);
    const questTemplateAddonService = TestBed.inject(QuestTemplateAddonService);

    return { service, mysqlQueryService, questTemplateService, questTemplateAddonService };
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

  it('mysqlQuery', async() => {
    const { service, mysqlQueryService, questTemplateService } = setup();
    const mockID = 123;
    const mockItem = '1234';
    const mockItemName = 'Helias Item';

    spyOn(mysqlQueryService, 'getItemByStartQuest').and.callFake(i => of(mockItem).toPromise());
    spyOn(mysqlQueryService, 'getItemNameByStartQuest').and.callFake(i => of(mockItemName).toPromise());
    questTemplateService.form.controls.ID.setValue(mockID);

    expect(await service.questGivenByItem).toBe(mockItem);
    expect(await service.questStarterItem).toBe(mockItemName);

    expect(mysqlQueryService.getItemByStartQuest).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getItemByStartQuest).toHaveBeenCalledWith(mockID);
    expect(mysqlQueryService.getItemNameByStartQuest).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getItemNameByStartQuest).toHaveBeenCalledWith(mockID);
  });

  it('initializeService', () => {
    const { service, questTemplateService } = setup();
    const initServiceSpy: Spy = spyOn<any>(service, 'initService').and.callThrough();
    const questTemplateLoadReloadSpy: Spy = spyOn(TestBed.inject(QuestTemplateService), 'reload');
    const questRequestItemLoadReloadSpy: Spy = spyOn(TestBed.inject(QuestRequestItemsService), 'reload');
    const questTemplateAddonLoadReloadSpy: Spy = spyOn(TestBed.inject(QuestTemplateAddonService), 'reload');
    const gameObjectQueststarterLoadReloadSpy: Spy = spyOn(TestBed.inject(GameobjectQueststarterService), 'reload');
    const gameObjectQuestenderLoadReloadSpy: Spy = spyOn(TestBed.inject(GameobjectQuestenderService), 'reload');
    const creatureQueststarterLoadReloadSpy: Spy = spyOn(TestBed.inject(CreatureQueststarterService), 'reload');
    const creatureQuestenderLoadReloadSpy: Spy = spyOn(TestBed.inject(CreatureQuestenderService), 'reload');
    const mockEntity = '123';

    questTemplateService['_loadedEntityId'] = mockEntity;
    TestBed.inject(QuestHandlerService)['_selected'] = mockEntity;

    service.initializeServices();

    expect(initServiceSpy).toHaveBeenCalledWith(TestBed.inject(QuestTemplateService));
    expect(initServiceSpy).toHaveBeenCalledWith(TestBed.inject(QuestRequestItemsService));
    expect(initServiceSpy).toHaveBeenCalledWith(TestBed.inject(QuestTemplateAddonService));
    expect(initServiceSpy).toHaveBeenCalledWith(TestBed.inject(GameobjectQueststarterService));
    expect(initServiceSpy).toHaveBeenCalledWith(TestBed.inject(GameobjectQuestenderService));
    expect(initServiceSpy).toHaveBeenCalledWith(TestBed.inject(CreatureQueststarterService));
    expect(initServiceSpy).toHaveBeenCalledWith(TestBed.inject(CreatureQuestenderService));
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

  describe('prevQuestList', () => {

  });
});
