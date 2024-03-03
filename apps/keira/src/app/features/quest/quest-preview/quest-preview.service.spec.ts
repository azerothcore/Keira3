import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  QUEST_FLAG_DAILY,
  QUEST_FLAG_REPEATABLE,
  QUEST_FLAG_SPECIAL_MONTHLY,
  QUEST_FLAG_SPECIAL_REPEATABLE,
  QUEST_FLAG_WEEKLY,
  QUEST_PERIOD,
} from '@keira/shared-constants';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { ToastrModule } from 'ngx-toastr';
import { CreatureQuestenderService } from '../creature-questender/creature-questender.service';
import { CreatureQueststarterService } from '../creature-queststarter/creature-queststarter.service';
import { GameobjectQuestenderService } from '../gameobject-questender/gameobject-questender.service';
import { GameobjectQueststarterService } from '../gameobject-queststarter/gameobject-queststarter.service';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestOfferRewardService } from '../quest-offer-reward/quest-offer-reward.service';
import { QuestRequestItemsService } from '../quest-request-items/quest-request-items.service';
import { QuestTemplateAddonService } from '../quest-template-addon/quest-template-addon.service';
import { QuestTemplateService } from '../quest-template/quest-template.service';
import { QuestModule } from '../quest.module';
import { DifficultyLevel } from './quest-preview.model';
import { QuestPreviewService } from './quest-preview.service';
import Spy = jasmine.Spy;
import { mockChangeDetectorRef } from '@keira-testing/mocks';

describe('QuestPreviewService', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), RouterTestingModule, QuestModule],
      providers: [QuestTemplateService],
    });
  }));

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

    spyOn(mysqlQueryService, 'getQuestTitleById').and.callFake((i) => Promise.resolve('Title' + i));
    spyOn(mysqlQueryService, 'getPrevQuestById').and.callFake((id: number) => Promise.resolve(String(id > 0 ? id - 1 : 0)));
    spyOn(mysqlQueryService, 'getNextQuestById').and.callFake((id: number) => Promise.resolve(String(id < MAX_NEXT_QUEST_ID ? id + 1 : 0)));
    spyOn(mysqlQueryService, 'getGameObjectNameById').and.callFake(() => Promise.resolve('Helias Gameobject'));
    spyOn(mysqlQueryService, 'getCreatureNameById').and.callFake(() => Promise.resolve('Helias Creature'));

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
    const { service, creatureQueststarterService, creatureQuestenderService, gameobjectQueststarterService, gameobjectQuestenderService } =
      setup();
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

  it('start item', waitForAsync(async () => {
    const { service, questTemplateService, mysqlQueryService } = setup();
    const mockStartItem = 123456;
    const mockStartItemName = 'Sword of AzerothCore';
    spyOn(mysqlQueryService, 'getItemNameById').and.callFake(() => Promise.resolve(mockStartItemName));

    questTemplateService.form.controls.StartItem.setValue(mockStartItem);

    expect(service.startItem).toEqual(mockStartItem);
    expect(await service.startItemName$).toEqual(mockStartItemName);
    expect(mysqlQueryService.getItemNameById).toHaveBeenCalledWith(mockStartItem);
  }));

  it('handle questTemplateAddon values', () => {
    const { service, questTemplateAddonService } = setup();

    const maxlevel = 80;
    questTemplateAddonService.form.controls.MaxLevel.setValue(maxlevel);
    expect(service.maxLevel).toBe(String(maxlevel));

    questTemplateAddonService.form.controls.AllowableClasses.setValue(240);
    expect(service.classes).toEqual([5, 6, 7, 8]);
  });

  it('mysqlQuery', async () => {
    const { service, mysqlQueryService, questTemplateService } = setup();
    const mockID = 123;
    const mockItem = '1234';
    const mockItemName = 'Helias Item';
    const mockQuestReputationReward = {
      faction: 1,
      quest_rate: 1,
      quest_daily_rate: 1,
      quest_weekly_rate: 1,
      quest_monthly_rate: 1,
      quest_repeatable_rate: 1,
      creature_rate: 1,
      spell_rate: 1,
    };

    spyOn(mysqlQueryService, 'getItemByStartQuest').and.callFake(() => Promise.resolve(mockItem));
    spyOn(mysqlQueryService, 'getItemNameByStartQuest').and.callFake(() => Promise.resolve(mockItemName));
    spyOn(mysqlQueryService, 'getReputationRewardByFaction').and.callFake(() => Promise.resolve([mockQuestReputationReward]));
    questTemplateService.form.controls.ID.setValue(mockID);

    expect(await service.questGivenByItem$).toBe(mockItem);
    expect(await service.questStarterItem$).toBe(mockItemName);
    expect(await service.getRepReward$(1)).toEqual([mockQuestReputationReward]);

    expect(mysqlQueryService.getItemByStartQuest).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getItemByStartQuest).toHaveBeenCalledWith(mockID);
    expect(mysqlQueryService.getItemNameByStartQuest).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getItemNameByStartQuest).toHaveBeenCalledWith(mockID);
    expect(mysqlQueryService.getReputationRewardByFaction).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getReputationRewardByFaction).toHaveBeenCalledWith(null);
  });

  it('sqliteQuery', async () => {
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
    const questOfferRewardServiceLoadReloadSpy: Spy = spyOn(TestBed.inject(QuestOfferRewardService), 'reload');
    const mockEntity = '123';

    questTemplateService['_loadedEntityId'] = mockEntity;
    TestBed.inject(QuestHandlerService)['_selected'] = mockEntity;

    service.initializeServices(mockChangeDetectorRef);

    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(QuestTemplateService));
    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(QuestRequestItemsService));
    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(QuestTemplateAddonService));
    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(GameobjectQueststarterService));
    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(GameobjectQuestenderService));
    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(CreatureQueststarterService));
    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(CreatureQuestenderService));
    expect(initServiceSpy).toHaveBeenCalledWith(mockChangeDetectorRef, TestBed.inject(QuestOfferRewardService));
    expect(initServiceSpy).toHaveBeenCalledTimes(8);

    // initService
    expect(questTemplateLoadReloadSpy).toHaveBeenCalledTimes(0);
    expect(questRequestItemLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(questTemplateAddonLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(gameObjectQueststarterLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(gameObjectQuestenderLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(creatureQueststarterLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(creatureQuestenderLoadReloadSpy).toHaveBeenCalledTimes(1);
    expect(questTemplateLoadReloadSpy).not.toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
    expect(questRequestItemLoadReloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
    expect(questTemplateAddonLoadReloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
    expect(gameObjectQueststarterLoadReloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
    expect(gameObjectQuestenderLoadReloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
    expect(creatureQueststarterLoadReloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
    expect(creatureQuestenderLoadReloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
    expect(questOfferRewardServiceLoadReloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, mockEntity);
  });

  describe('prevQuestList', () => {
    it('should correctly work when PrevQuestID is set', waitForAsync(async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.PrevQuestID.setValue(3);

      expect(await service.prevQuestList$).toEqual([
        { id: 1, title: 'Title1' },
        { id: 2, title: 'Title2' },
        { id: 3, title: 'Title3' },
      ]);
      expect(await service.prevQuestList$).toEqual([
        // check cache
        { id: 1, title: 'Title1' },
        { id: 2, title: 'Title2' },
        { id: 3, title: 'Title3' },
      ]);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledTimes(3);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledWith(3);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledWith(2);
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledWith(1);
    }));

    it('should correctly work when PrevQuestID is NOT set', waitForAsync(async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.PrevQuestID.setValue(0);

      expect(await service.prevQuestList$).toEqual([]);
      expect(await service.prevQuestList$).toEqual([]); // check cache
      expect(mysqlQueryService.getPrevQuestById).toHaveBeenCalledTimes(0);
    }));
  });

  describe('nextQuestList', () => {
    it('should correctly work when NextQuestID is set', waitForAsync(async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.NextQuestID.setValue(5);

      expect(await service.nextQuestList$).toEqual([
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(await service.nextQuestList$).toEqual([
        // check cache
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledTimes(3);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(5);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(6);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(7);
    }));

    it('should correctly work when NextQuestID is NOT set', waitForAsync(async () => {
      const { service, mysqlQueryService, questTemplateService, questTemplateAddonService } = setup();
      questTemplateService.form.controls.ID.setValue(4);
      questTemplateAddonService.form.controls.NextQuestID.setValue(0);

      expect(await service.nextQuestList$).toEqual([
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(await service.nextQuestList$).toEqual([
        // check cache
        { id: 5, title: 'Title5' },
        { id: 6, title: 'Title6' },
        { id: 7, title: 'Title7' },
      ]);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledTimes(4);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(4, true);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(5, true);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(6, true);
      expect(mysqlQueryService.getNextQuestById).toHaveBeenCalledWith(7, true);
    }));
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

  it('enabledByQuestTitle$ should return the quest name', waitForAsync(async () => {
    const id = 123;
    const { service, questTemplateAddonService, mysqlQueryService } = setup();
    questTemplateAddonService.form.controls.PrevQuestID.setValue(-id);

    expect(await service.enabledByQuestTitle$).toEqual(`Title${id}`);
    expect(mysqlQueryService.getQuestTitleById).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getQuestTitleById).toHaveBeenCalledWith(id);
  }));

  it('isRepeatable', () => {
    const { service, questTemplateService, questTemplateAddonService } = setup();

    expect(service.isRepeatable()).toBe(false);

    questTemplateAddonService.form.controls.SpecialFlags.setValue(QUEST_FLAG_SPECIAL_REPEATABLE);
    expect(service.isRepeatable()).toBe(true);

    questTemplateService.form.controls.Flags.setValue(QUEST_FLAG_REPEATABLE);
    expect(service.isRepeatable()).toBe(true);
  });

  describe('getRewardReputation', () => {
    const mockRepValue = 123;
    const mockRepFaction = 1;
    const dailyRate = 3;
    const weeklyRate = 4;
    const monthlyRate = 5;
    const repeatableRate = 6;
    const questRate = 7;
    const mockQuestReputationReward1 = {
      faction: 1,
      quest_rate: 1,
      quest_daily_rate: 1,
      quest_weekly_rate: 1,
      quest_monthly_rate: 1,
      quest_repeatable_rate: 1,
      creature_rate: 1,
      spell_rate: 1,
    };
    const mockQuestReputationReward2 = {
      faction: 2,
      quest_rate: questRate,
      quest_daily_rate: dailyRate,
      quest_weekly_rate: weeklyRate,
      quest_monthly_rate: monthlyRate,
      quest_repeatable_rate: repeatableRate,
      creature_rate: 2,
      spell_rate: 2,
    };

    it('with empty QuestReputationReward', () => {
      const { service } = setup();
      expect(service.getRewardReputation(1, [])).toBe(null);
    });

    it('QuestReputation values 1', () => {
      const { service, questTemplateService } = setup();
      questTemplateService.form.controls.RewardFactionID1.setValue(mockRepFaction);
      questTemplateService.form.controls.RewardFactionValue1.setValue(mockRepValue);

      expect(service.getRewardReputation(1, [])).toBe(mockRepValue);
      expect(service.getRewardReputation(1, [mockQuestReputationReward1])).toBe(mockRepValue);
    });

    it('all dailyType and normal quest_rate', () => {
      const { service, questTemplateService } = setup();
      const getPeriodicQuestSpy: Spy = spyOn<any>(service, 'getPeriodicQuest');
      questTemplateService.form.controls.RewardFactionID1.setValue(mockRepFaction);
      questTemplateService.form.controls.RewardFactionValue1.setValue(mockRepValue);

      getPeriodicQuestSpy.and.returnValue(QUEST_PERIOD.DAILY);
      expect(service.getRewardReputation(1, [mockQuestReputationReward2])).toBe(mockRepValue * (dailyRate - 1));

      getPeriodicQuestSpy.and.returnValue(QUEST_PERIOD.WEEKLY);
      expect(service.getRewardReputation(1, [mockQuestReputationReward2])).toBe(mockRepValue * (weeklyRate - 1));

      getPeriodicQuestSpy.and.returnValue(QUEST_PERIOD.MONTHLY);
      expect(service.getRewardReputation(1, [mockQuestReputationReward2])).toBe(mockRepValue * (monthlyRate - 1));

      getPeriodicQuestSpy.and.returnValue('mockPeriod');
      expect(service.getRewardReputation(1, [mockQuestReputationReward2])).toBe(mockRepValue * (questRate - 1));
    });

    it('in case of repeatable quest', () => {
      const { service, questTemplateService } = setup();
      spyOn(service, 'isRepeatable').and.returnValue(true);
      questTemplateService.form.controls.RewardFactionID1.setValue(mockRepFaction);
      questTemplateService.form.controls.RewardFactionValue1.setValue(mockRepValue);

      expect(service.getRewardReputation(1, [mockQuestReputationReward2])).toBe(mockRepValue * (repeatableRate - 1));
    });

    it('getObjective$', async () => {
      const { service, questTemplateService, mysqlQueryService } = setup();

      questTemplateService.form.controls.RequiredNpcOrGo1.setValue(0);
      expect(await service.getObjective$(1)).toBeUndefined();

      questTemplateService.form.controls.RequiredNpcOrGo1.setValue(-1);
      expect(await service.getObjective$(1)).toBe('Helias Gameobject');
      expect(mysqlQueryService.getGameObjectNameById).toHaveBeenCalledTimes(1);
      expect(mysqlQueryService.getGameObjectNameById).toHaveBeenCalledWith(1);

      questTemplateService.form.controls.RequiredNpcOrGo1.setValue(1);
      expect(await service.getObjective$(1)).toBe('Helias Creature');
      expect(mysqlQueryService.getCreatureNameById).toHaveBeenCalledTimes(1);
      expect(mysqlQueryService.getCreatureNameById).toHaveBeenCalledWith(1);
    });

    it('getObjectiveCount', () => {
      const { service, questTemplateService } = setup();

      questTemplateService.form.controls.RequiredNpcOrGoCount1.setValue(0);
      expect(service.getObjectiveCount(1)).toBe('');

      questTemplateService.form.controls.RequiredNpcOrGoCount1.setValue(2);
      expect(service.getObjectiveCount(1)).toBe('(2)');
    });

    it('isNpcOrGo', () => {
      const { service, questTemplateService } = setup();

      questTemplateService.form.controls.RequiredNpcOrGoCount1.setValue(0);
      expect(service.isNpcOrGoObj(1)).toBeFalse();

      questTemplateService.form.controls.RequiredNpcOrGoCount1.setValue(1);
      expect(service.isNpcOrGoObj(1)).toBeTrue();
    });

    it('getObjItemCount', () => {
      const { service, questTemplateService } = setup();

      questTemplateService.form.controls.RequiredItemCount1.setValue(0);
      expect(service.getObjItemCount(1)).toBe('');

      questTemplateService.form.controls.RequiredItemCount1.setValue(2);
      expect(service.getObjItemCount(1)).toBe('(2)');
    });

    it('getFactionByValue', () => {
      const { service, questTemplateService } = setup();

      questTemplateService.form.controls.RequiredFactionValue1.setValue(0);
      expect(service.getFactionByValue(1)).toBe('');

      questTemplateService.form.controls.RequiredFactionValue1.setValue(900);
      expect(service.getFactionByValue(1)).toBe('(Neutral)');

      questTemplateService.form.controls.RequiredFactionValue1.setValue(2100);
      expect(service.getFactionByValue(1)).toBe('(Neutral)');

      questTemplateService.form.controls.RequiredFactionValue1.setValue(3000);
      expect(service.getFactionByValue(1)).toBe('(Friendly)');

      questTemplateService.form.controls.RequiredFactionValue1.setValue(9000);
      expect(service.getFactionByValue(1)).toBe('(Honored)');

      questTemplateService.form.controls.RequiredFactionValue1.setValue(21000);
      expect(service.getFactionByValue(1)).toBe('(Revered)');

      questTemplateService.form.controls.RequiredFactionValue1.setValue(42000);
      expect(service.getFactionByValue(1)).toBe('(Exalted)');
    });

    it('getObjText', () => {
      const { service, questTemplateService } = setup();

      questTemplateService.form.controls.ObjectiveText1.setValue('mock objective');
      expect(service.getObjText(1)).toBe('mock objective');
    });

    it('get objectiveText', () => {
      const { service, questTemplateService } = setup();

      questTemplateService.form.controls.LogDescription.setValue('mock objective text');
      expect(service.objectiveText).toBe('mock objective text');
    });

    it('isFieldAvailable', () => {
      const { service, questTemplateService } = setup();

      expect(service.isFieldAvailable('RewardFactionID', 'RewardFactionValue', 1)).toBeFalse();

      questTemplateService.form.controls.RewardFactionID1.setValue(123);
      questTemplateService.form.controls.RewardFactionValue1.setValue(10);

      expect(service.isFieldAvailable('RewardFactionID', 'RewardFactionValue', 1)).toBeTrue();
    });

    it('isRewardReputation', () => {
      const { service } = setup();
      const isFieldAvailableSpy = spyOn(service, 'isFieldAvailable').and.returnValue(false);

      expect(service.isRewardReputation()).toBeFalse();

      isFieldAvailableSpy.and.callFake((f1, f2, idx) => idx === 5); // return true in the last condition
      expect(service.isRewardReputation()).toBeTrue();

      expect(isFieldAvailableSpy).toHaveBeenCalledTimes(10);
    });

    it('isRewardItems', () => {
      const { service } = setup();
      const isFieldAvailableSpy = spyOn(service, 'isFieldAvailable').and.returnValue(false);

      expect(service.isRewardItems()).toBeFalse();

      isFieldAvailableSpy.and.callFake((f1, f2, idx) => idx === 4); // return true in the last condition
      expect(service.isRewardItems()).toBeTrue();

      expect(isFieldAvailableSpy).toHaveBeenCalledTimes(8);
    });

    it('isRewardChoiceItems', () => {
      const { service } = setup();
      const isFieldAvailableSpy = spyOn(service, 'isFieldAvailable').and.returnValue(false);

      expect(service.isRewardChoiceItems()).toBeFalse();

      isFieldAvailableSpy.and.callFake((f1, f2, idx) => idx === 4); // return true in the last condition
      expect(service.isRewardChoiceItems()).toBeTrue();

      expect(isFieldAvailableSpy).toHaveBeenCalledTimes(8);
    });

    it('isGains', () => {
      const { service, questTemplateService } = setup();

      expect(service.isGains()).toBeFalse();

      questTemplateService.form.controls.RewardXPDifficulty.setValue(1);
      expect(service.isGains()).toBeTrue();

      questTemplateService.form.controls.RewardXPDifficulty.setValue(0);
      questTemplateService.form.controls.RewardTalents.setValue(1);
      expect(service.isGains()).toBeTrue();

      questTemplateService.form.controls.RewardTalents.setValue(0);
      spyOn(service, 'isRewardReputation').and.returnValue(true);
      expect(service.isGains()).toBeTrue();
    });

    it('isReward', () => {
      const { service } = setup();
      spyOn(service, 'isRewardItems').and.returnValue(false);
      spyOn(service, 'isRewardChoiceItems').and.returnValue(false);
      const rewardSpellSpy = spyOn(service, 'rewardSpell').and.returnValue(0);

      expect(service.isReward()).toBeFalse();

      rewardSpellSpy.and.returnValue(1);
      expect(service.isReward()).toBeTrue();

      expect(service.isRewardItems).toHaveBeenCalledTimes(2);
      expect(service.isRewardChoiceItems).toHaveBeenCalledTimes(2);
      expect(rewardSpellSpy).toHaveBeenCalledTimes(2);
    });

    it('rewardSpell', () => {
      const { service, questTemplateService } = setup();

      expect(service.rewardSpell()).toBeNull();

      questTemplateService.form.controls.RewardSpell.setValue(124);
      expect(service.rewardSpell()).toBe(124);

      questTemplateService.form.controls.RewardDisplaySpell.setValue(123);
      expect(service.rewardSpell()).toBe(123);
    });

    it('isUnavailable() should correctly work', () => {
      const { service, questTemplateService } = setup();
      const UNAVAILABLE = 0x04000;

      questTemplateService.form.controls.Flags.setValue(0);
      expect(service.isUnavailable()).toBeFalse();

      questTemplateService.form.controls.Flags.setValue(UNAVAILABLE);
      expect(service.isUnavailable()).toBeTrue();

      questTemplateService.form.controls.Flags.setValue(UNAVAILABLE + 2);
      expect(service.isUnavailable()).toBeTrue();

      questTemplateService.form.controls.Flags.setValue(UNAVAILABLE - 2);
      expect(service.isUnavailable()).toBeFalse();
    });
  });
});
