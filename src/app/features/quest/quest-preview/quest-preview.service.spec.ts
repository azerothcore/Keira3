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
import { DifficultyLevel } from './quest-preview.model';
import { QUEST_FLAG_DAILY, QUEST_FLAG_WEEKLY, QUEST_FLAG_SPECIAL_MONTHLY, QUEST_FLAG_SPECIAL_REPEATABLE, QUEST_FLAG_REPEATABLE } from '@keira-shared/constants/quest-preview';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';

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
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const questTemplateService = TestBed.inject(QuestTemplateService);
    const questTemplateAddonService = TestBed.inject(QuestTemplateAddonService);
    const questRequestItemsService = TestBed.inject(QuestRequestItemsService);
    const gameobjectQueststarterService = TestBed.inject(GameobjectQueststarterService);
    const gameobjectQuestenderService = TestBed.inject(GameobjectQuestenderService);
    const creatureQueststarterService = TestBed.inject(CreatureQueststarterService);
    const creatureQuestenderService = TestBed.inject(CreatureQuestenderService);
    const MAX_NEXT_QUEST_ID = 7;

    spyOn(mysqlQueryService, 'getQuestTitleById').and.callFake(i => of('Title' + i).toPromise());
    spyOn(mysqlQueryService, 'getPrevQuestById').and.callFake(
      (id: number) => of(String(id > 0 ? (id - 1) : 0)).toPromise()
    );
    spyOn(mysqlQueryService, 'getNextQuestById').and.callFake(
      (id: number) => of(String(id < MAX_NEXT_QUEST_ID ? (id + 1) : 0)).toPromise()
    );

    return {
      service,
      mysqlQueryService,
      sqliteQueryService,
      questTemplateService,
      questTemplateAddonService,
      questRequestItemsService,
      gameobjectQueststarterService,
      gameobjectQuestenderService,
      creatureQueststarterService,
      creatureQuestenderService,
      MAX_NEXT_QUEST_ID,
    };
  };

  it('getters', () => {
    const {
      service,
      creatureQueststarterService,
      creatureQuestenderService,
      gameobjectQueststarterService,
      gameobjectQuestenderService,
    } = setup();
    creatureQueststarterService.addNewRow();
    creatureQuestenderService.addNewRow();
    gameobjectQueststarterService.addNewRow();
    gameobjectQuestenderService.addNewRow();
    creatureQueststarterService.newRows[0].id = 111;
    creatureQuestenderService.newRows[0].id = 222;
    gameobjectQueststarterService.newRows[0].id = 333;
    gameobjectQuestenderService.newRows[0].id = 444;

    expect(service.creatureQueststarterList).toEqual(creatureQueststarterService.newRows);
    expect(service.creatureQuestenderList).toEqual(creatureQuestenderService.newRows);
    expect(service.gameobjectQueststarterList).toEqual(gameobjectQueststarterService.newRows);
    expect(service.gameobjectQuestenderList).toEqual(gameobjectQuestenderService.newRows);
  });

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
    expect(service.races).toEqual([1, 2, 4, 5, 6, 7]);

    questTemplateService.form.controls.AllowableRaces.setValue(null);
    expect(service.races).toBeNull();

    // check if quest is sharable
    questTemplateService.form.controls.Flags.setValue(8);
    expect(service.sharable).toBe('Sharable');

    questTemplateService.form.controls.Flags.setValue(4);
    expect(service.sharable).toBe('Not sharable');
  });

  it('handle questTemplateAddon values', () => {
    const { service, questTemplateAddonService } = setup();

    const maxlevel = 80;
    questTemplateAddonService.form.controls.MaxLevel.setValue(maxlevel);
    expect(service.maxLevel).toBe(String(maxlevel));

    questTemplateAddonService.form.controls.AllowableClasses.setValue(240);
    expect(service.classes).toEqual([5, 6, 7, 8]);
  });

  it('mysqlQuery', async() => {
    const { service, mysqlQueryService, questTemplateService } = setup();
    const mockID = 123;
    const mockItem = '1234';
    const mockItemName = 'Helias Item';

    spyOn(mysqlQueryService, 'getItemByStartQuest').and.callFake(() => of(mockItem).toPromise());
    spyOn(mysqlQueryService, 'getItemNameByStartQuest').and.callFake(() => of(mockItemName).toPromise());
    questTemplateService.form.controls.ID.setValue(mockID);

    expect(await service.questGivenByItem$).toBe(mockItem);
    expect(await service.questStarterItem$).toBe(mockItemName);

    expect(mysqlQueryService.getItemByStartQuest).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getItemByStartQuest).toHaveBeenCalledWith(mockID);
    expect(mysqlQueryService.getItemNameByStartQuest).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getItemNameByStartQuest).toHaveBeenCalledWith(mockID);
  });

  it('sqliteQuery', async() => {
    const { service, sqliteQueryService, questTemplateService, questTemplateAddonService } = setup();
    const mockSkillName = 'Mock Skill';
    const mockSkill = 755;
    const mockRewardXP = '450';
    const mockDifficulty = 1;
    const mockQuestLevel = 2;
    questTemplateAddonService.form.controls.RequiredSkillID.setValue(mockSkill);
    questTemplateService.form.controls.RewardXPDifficulty.setValue(mockDifficulty);
    questTemplateService.form.controls.QuestLevel.setValue(mockQuestLevel);

    spyOn(sqliteQueryService, 'getSkillNameById').and.callFake(() => Promise.resolve(mockSkillName));
    spyOn(sqliteQueryService, 'getRewardXP').and.callFake(() => Promise.resolve(mockRewardXP));

    expect(await service.requiredSkill$).toBe(mockSkillName);
    expect(await service.rewardXP$).toBe(mockRewardXP);

    expect(sqliteQueryService.getSkillNameById).toHaveBeenCalledTimes(1);
    expect(sqliteQueryService.getSkillNameById).toHaveBeenCalledWith(mockSkill);
    expect(sqliteQueryService.getRewardXP).toHaveBeenCalledTimes(1);
    expect(sqliteQueryService.getRewardXP).toHaveBeenCalledWith(mockDifficulty, mockQuestLevel);
  });

  it('difficultyLevels', () => {
    const { service, questTemplateService } = setup();
    let difficulty: DifficultyLevel;

    // no QuestLevel
    questTemplateService.form.controls.QuestLevel.setValue(0);
    difficulty = service.difficultyLevels;
    expect(difficulty).toBeNull();

    // red colors undefined
    questTemplateService.form.controls.QuestLevel.setValue(50);
    difficulty = service.difficultyLevels;

    expect(difficulty.red).toBeUndefined();
    expect(difficulty.orange).toBe(46);
    expect(difficulty.yellow).toBe(48);
    expect(difficulty.green).toBe(53);
    expect(difficulty.grey).toBe(61);

    // red, orange and yellow
    questTemplateService.form.controls.QuestLevel.setValue(50);
    questTemplateService.form.controls.MinLevel.setValue(45);

    difficulty = service.difficultyLevels;

    expect(difficulty.red).toBe(45);
    expect(difficulty.orange).toBe(46);
    expect(difficulty.yellow).toBe(48);

    // no red
    questTemplateService.form.controls.QuestLevel.setValue(50);
    questTemplateService.form.controls.MinLevel.setValue(47);

    difficulty = service.difficultyLevels;

    expect(difficulty.red).toBeUndefined();
    expect(difficulty.orange).toBe(47);
    expect(difficulty.yellow).toBe(48);

    // no red and orange
    questTemplateService.form.controls.QuestLevel.setValue(50);
    questTemplateService.form.controls.MinLevel.setValue(49);

    difficulty = service.difficultyLevels;

    expect(difficulty.red).toBeUndefined();
    expect(difficulty.orange).toBeUndefined();
    expect(difficulty.yellow).toBe(49);
  });

  it('periodicQuest', () => {
    const { service, questTemplateService, questTemplateAddonService } = setup();

    expect(service.periodicQuest).toBeNull();

    questTemplateAddonService.form.controls.SpecialFlags.setValue(QUEST_FLAG_SPECIAL_MONTHLY);
    expect(service.periodicQuest).toBe('Monthly');

    questTemplateService.form.controls.Flags.setValue(QUEST_FLAG_WEEKLY);
    expect(service.periodicQuest).toBe('Weekly');

    questTemplateService.form.controls.Flags.setValue(QUEST_FLAG_DAILY);
    expect(service.periodicQuest).toBe('Daily');
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

      expect(await service.prevQuestList$).toEqual([
        { id: 1, title: 'Title1' },
        { id: 2, title: 'Title2' },
        { id: 3, title: 'Title3' },
      ]);
      expect(await service.prevQuestList$).toEqual([ // check cache
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

      expect(await service.prevQuestList$).toEqual([]);
      expect(await service.prevQuestList$).toEqual([]); // check cache
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledTimes(0);
    });
  });

  describe('nextQuestList', () => {
    it('should correctly work when NextQuestID is set', async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.NextQuestID.setValue(5);

      expect(await service.nextQuestList$).toEqual([
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(await service.nextQuestList$).toEqual([ // check cache
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

      expect(await service.nextQuestList$).toEqual([
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(await service.nextQuestList$).toEqual([ // check cache
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

  describe('enabledByQuestId', () => {
    it('should return the PrevQuestID when negative', () => {
      const id = 123;
      const { service, questTemplateAddonService } = setup();
      questTemplateAddonService.form.controls.PrevQuestID.setValue(-id);

      expect(service.enabledByQuestId).toEqual(id);
    });

    it('should return 0 otherwise', () => {
      const { service, questTemplateAddonService } = setup();
      questTemplateAddonService.form.controls.PrevQuestID.setValue(123);

      expect(service.enabledByQuestId).toEqual(0);
    });
  });

  it('enabledByQuestTitle$ should return the quest name', async () => {
    const id = 123;
    const { service, questTemplateAddonService, mysqlQueryService } = setup();
    questTemplateAddonService.form.controls.PrevQuestID.setValue(-id);

    expect(await service.enabledByQuestTitle$).toEqual(`Title${id}`);
    expect(mysqlQueryService.getQuestTitleById).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getQuestTitleById).toHaveBeenCalledWith(id);
  });

  it('isRepeatable', () => {
    const { service, questTemplateService, questTemplateAddonService } = setup();

    expect(service.isRepeatable()).toBe(false);

    questTemplateAddonService.form.controls.SpecialFlags.setValue(QUEST_FLAG_SPECIAL_REPEATABLE);
    expect(service.isRepeatable()).toBe(true);

    questTemplateService.form.controls.Flags.setValue(QUEST_FLAG_REPEATABLE);
    expect(service.isRepeatable()).toBe(true);
  });
});
