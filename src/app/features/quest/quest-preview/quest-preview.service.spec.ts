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
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    const questTemplateService = TestBed.inject(QuestTemplateService);
    const questTemplateAddonService = TestBed.inject(QuestTemplateAddonService);
    const MAX_NEXT_QUEST_ID = 7;

    spyOn(mysqlQueryService, 'getQuestTitleById').and.callFake(i => of('Title' + i).toPromise());
    spyOn(mysqlQueryService, 'getPrevQuestById').and.callFake(
      (id: number) => of(String(id > 0 ? (id - 1) : 0)).toPromise()
    );
    spyOn(mysqlQueryService, 'getNextQuestById').and.callFake(
      (id: number) => of(String(id < MAX_NEXT_QUEST_ID ? (id + 1) : 0)).toPromise()
    );

    return { service, mysqlQueryService, questTemplateService, questTemplateAddonService, MAX_NEXT_QUEST_ID };
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
    it('should correctly work when PrevQuestID is set', async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.PrevQuestID.setValue(3);

      expect(await service.prevQuestList).toEqual([
        { id: 1, title: 'Title1' },
        { id: 2, title: 'Title2' },
        { id: 3, title: 'Title3' },
      ]);
      expect(await service.prevQuestList).toEqual([ // check cache
        { id: 1, title: 'Title1' },
        { id: 2, title: 'Title2' },
        { id: 3, title: 'Title3' },
      ]);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledTimes(3);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledWith(3);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledWith(2);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledWith(1);
    });

    it('should correctly work when PrevQuestID is NOT set', async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.PrevQuestID.setValue(0);

      expect(await service.prevQuestList).toEqual([]);
      expect(await service.prevQuestList).toEqual([]); // check cache
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledTimes(0);
    });
  });

  describe('nextQuestList', () => {
    it('should correctly work when NextQuestID is set', async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.NextQuestID.setValue(5);

      expect(await service.nextQuestList).toEqual([
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(await service.nextQuestList).toEqual([ // check cache
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledTimes(3);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(5);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(6);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(7);
    });

    it('should correctly work when NextQuestID is NOT set', async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.NextQuestID.setValue(0);

      expect(await service.nextQuestList).toEqual([
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(await service.nextQuestList).toEqual([ // check cache
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledTimes(4);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(4, true);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(5, true);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(6, true);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(7, true);
    });
  });
});
