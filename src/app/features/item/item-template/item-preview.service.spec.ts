import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ITEMS_QUALITY } from '@keira-shared/constants/options/item-quality';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { MockedToastrService } from '@keira-shared/testing/mocks';
import { ItemTemplate } from '@keira-shared/types/item-template.type';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { Lock } from './item-preview';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';

fdescribe('ItemPreviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemPreviewService,
      ItemTemplateService,
      ItemHandlerService,
    ]
  }));

    let service: ItemPreviewService;
    let sqliteQueryService: SqliteQueryService;
    let mysqlQueryService: MysqlQueryService;

    const createItem = (partial: Partial<ItemTemplate>) => Object.assign(new ItemTemplate(), partial);
    const mockItemNameById = 'mockItemNameById';
    const mockGetSpellNameById = 'mockGetSpellNameById';
    const mockGetSpellDescriptionById = 'mockGetSpellDescriptionById';
    const mockGetFactionNameById = 'mockGetFactionNameById';
    const mockGetLockById: Lock[] = [];
    const mockGetMapNameById = 'mockGetMapNameById';
    const mockGetAreaNameById = 'mockGetAreaNameById';
    const mockGetEventNameByHolidayId = 'mockGetEventNameByHolidayId';
    const mockGetSocketBonusById = 'mockGetSocketBonusById';

    beforeEach(() => {
      mysqlQueryService = TestBed.inject(MysqlQueryService);
      spyOn(mysqlQueryService, 'getItemNameById').and.callFake(i => of(mockItemNameById + i).toPromise());
      spyOn(mysqlQueryService, 'query').and.callFake(i => of([]));

      sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'getSpellNameById').and.callFake(i => of(mockGetSpellNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getSpellDescriptionById').and.callFake(i => of(mockGetSpellDescriptionById + i).toPromise());
      spyOn(sqliteQueryService, 'getFactionNameById').and.callFake(i => of(mockGetFactionNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getLockById').and.callFake(i => of(mockGetLockById).toPromise());
      spyOn(sqliteQueryService, 'getMapNameById').and.callFake(i => of(mockGetMapNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getAreaNameById').and.callFake(i => of(mockGetAreaNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getEventNameByHolidayId').and.callFake(i => of(mockGetEventNameByHolidayId + i).toPromise());
      spyOn(sqliteQueryService, 'getSocketBonusById').and.callFake(i => of(mockGetSocketBonusById + i).toPromise());
      spyOn(sqliteQueryService, 'query').and.callFake(i => of([]));

      service = TestBed.inject(ItemPreviewService);
    });

    it('getItemExtendedCostFromVendor', () => {
      service['getItemExtendedCostFromVendor'](123);
      expect(mysqlQueryService.query).toHaveBeenCalledTimes(1);
    });

    it('getItemsetSlotBak', () => {
      const id = 123;
      service['getItemsetSlotBak'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM items WHERE itemset = ${id} ORDER BY slotBak, id`);
    });

    it('getItemNameByIDsASC', () => {
      const IDs = [123, 1234];
      service['getItemNameByIDsASC'](IDs);
      expect(mysqlQueryService.query).toHaveBeenCalledTimes(1);
      expect(mysqlQueryService.query).toHaveBeenCalledWith(`SELECT name FROM item_template WHERE entry IN (${IDs.join(',')}) ORDER BY entry ASC`);
    });

    it('getItemsetById', () => {
      const id = 123;
      service['getItemsetById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM itemset WHERE id = ${id}`);
    });

    it('getItemLimitCategoryById', () => {
      const id = 123;
      service['getItemLimitCategoryById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM item_limit_category WHERE id = ${id}`);
    });

    it('getGemEnchantmentIdById', () => {
      const id = 123;
      service['getGemEnchantmentIdById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT gemEnchantmentId AS v FROM items WHERE id = ${id};`);
    });

    it('getItemEnchantmentById', () => {
      const id = 123;
      service['getItemEnchantmentById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM item_enchantment WHERE id = ${id}`);
    });

    it('getItemExtendedCost', () => {
      const IDs = [123, 1234];
      service['getItemExtendedCost'](IDs);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM item_extended_cost WHERE id IN (${IDs.join(',')})`);
    });

    it('getItemEnchantmentConditionById', () => {
      const id = 123;
      service['getItemEnchantmentConditionById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM item_enchantment_condition WHERE id = ${id}`);
    });

    const cases = [
      { name: 'Empty variables',  template: { }, output: ''  },
      { name: 'Item Name & Quality', template: { name: 'Helias Item', Quality: 1 }, output: `<b class="item-name q1">Helias Item</b>` },
      { name: 'Quality 0', template: { name: 'Helias Item', Quality: 0 }, output: `<b class="item-name q0">Helias Item</b>` },
      { name: 'Quality null', template: { name: 'Helias Item'  }, output: `<b class="item-name q">Helias Item</b>` },
      { name: 'All Flags & Quality Epic', template: { Quality: ITEMS_QUALITY.EPIC, Flags: -1 }, output: `<br><!-- ITEM_FLAG.HEROIC --><span class="q2">Heroic</span><br> Conjured Item<br><!-- bonding[0] -->Binds to account<br><!-- uniqueEquipped -->Unique-Equipped` },
      { name: 'Empty variables',  template: { HolidayId: 140 }, output: `<br>Requires ${mockGetEventNameByHolidayId}140` },
      { name: 'StartQuest',       template: { startquest: 1  }, output: `<br><span class="q1">This Item Begins a Quest</span>` },
      { name: 'ContainerSlots',   template: { ContainerSlots: 1  }, output: `<br>1 Slot Bag` },
      { name: 'ContainerSlots-2', template: { ContainerSlots: 1, BagFamily: 2 }, output: `<br>1 Slot Ammo Pouch` },
      { name: 'RandomProperty',   template: { RandomProperty: 1 }, output: `<br><span class="q2">&lt;Random enchantment&gt</span>` },
      { name: 'RandomSuffix',     template: { RandomSuffix: 1 }, output: `<br><span class="q2">&lt;Random enchantment&gt</span>` },
      { name: 'Durability',       template: { MaxDurability: 100 }, output: `<br>Durability 100 / 100` },
      { name: 'Sell Price',       template: { SellPrice: 123456 }, output: `<br>Sell Price: <span class="moneygold">12</span> &nbsp;<span class="moneysilver">34</span> &nbsp;<span class="moneycopper">56</span> &nbsp;` },
      { name: 'Sell Price-1',     template: { SellPrice: 9999 }, output: `<br>Sell Price: <span class="moneysilver">99</span> &nbsp;<span class="moneycopper">99</span> &nbsp;` },
      { name: 'Sell Price-2',     template: { SellPrice: 99 }, output: `<br>Sell Price: <span class="moneycopper">99</span> &nbsp;` },
      { name: 'Sell Price-3',     template: { SellPrice: -1 }, output: `` },
      { name: 'Stats 1',          template: { stat_type1: 1, stat_value1: 1 }, output: `<br><span><!--stat1-->+1 Health</span>` },
      { name: 'Stats -1',         template: { stat_type1: 1, stat_value1: -1 }, output: `<br><span><!--stat1-->-1 Health</span>` },
      { name: 'Stats type null',  template: { stat_type1: 8, stat_value1: 1 }, output: `` },
      { name: 'Stats 12, ReqLvL', template: { stat_type1: 12, stat_value1: 1, RequiredLevel: 71 }, output: `<br>Requires Level 71<br><span class="q2">Equip: Increases defense rating by <!--rtg12-->1&nbsp;<small>(<!--rtg%12-->0.39&nbsp;@&nbsp;L<!--lvl-->71)</small>.</span>` },
      { name: 'Stats 13, ReqLvL', template: { stat_type1: 13, stat_value1: 1, RequiredLevel: 71 }, output: `<br>Requires Level 71<br><span class="q2">Equip: Increases your dodge rating by <!--rtg13-->1&nbsp;<small>(<!--rtg%13-->0.04%&nbsp;@&nbsp;L<!--lvl-->71)</small>.</span>` },
      { name: 'Stats 13, ReqLvL', template: { stat_type1: 13, stat_value1: 1, RequiredLevel: 61 }, output: `<br>Requires Level 61<br><span class="q2">Equip: Increases your dodge rating by <!--rtg13-->1&nbsp;<small>(<!--rtg%13-->0.07%&nbsp;@&nbsp;L<!--lvl-->61)</small>.</span>` },
      { name: 'Stats 13, ReqLvL', template: { stat_type1: 13, stat_value1: 1, RequiredLevel: 11 }, output: `<br>Requires Level 11<br><span class="q2">Equip: Increases your dodge rating by <!--rtg13-->1&nbsp;<small>(<!--rtg%13-->0.14%&nbsp;@&nbsp;L<!--lvl-->34)</small>.</span>` },
      { name: 'Stats 16, ReqLvL', template: { stat_type1: 16, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><span class="q2">Equip: Improves melee hit rating by <!--rtg16-->1&nbsp;<small>(<!--rtg%16-->2.60%&nbsp;@&nbsp;L<!--lvl-->8)</small>.</span>` },
      { name: 'Stats 38, ReqLvL', template: { stat_type1: 38, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><span class="q2">Equip: Increases attack power by <!--rtg38-->1.</span>` },
      { name: 'Stats 48, ReqLvL', template: { stat_type1: 48, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><span class="q2">Equip: Increases the block value of your shield by <!--rtg48-->1.</span>` },
      { name: 'Stats 39, ReqLvL', template: { stat_type1: 39, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><span class="q2">Equip: Increases ranged attack power by <!--rtg39-->1&nbsp;<small>(<!--rtg%39-->%&nbsp;@&nbsp;L<!--lvl-->8)</small>.</span>` },
      { name: 'AllowableClass Paladin', template: { AllowableClass: 2 }, output: `<br>Classes: <span class="c2">Paladin</span>` },
      { name: 'AllowableClass All',     template: { AllowableClass: -1 }, output: `` },
      { name: 'AllowableRace All',      template: { AllowableRace: -1 }, output: `` },
      { name: 'AllowableRace Alliance', template: { AllowableRace: 1101 }, output: `<br>Races: Alliance` },
      { name: 'AllowableRace Horde',    template: { AllowableRace: 690 }, output: `<br>Races: Horde` },
      { name: 'AllowableRace Human',    template: { AllowableRace: 1 }, output: `<br>Races: Human` },
      { name: 'AllowableRace Orc',      template: { AllowableRace: 2 }, output: `<br>Races: Orc` },
      { name: 'Duration 1 day',         template: { duration: 3600 * 24 }, output: `<br>Duration: 1 day` },
      { name: 'Duration 1 hour',        template: { duration: 3600 }, output: `<br>Duration: 1 hour` },
      { name: 'Duration 1 minute',      template: { duration: 60 }, output: `<br>Duration: 1 minute` },
      { name: 'Duration 10 secs',       template: { duration: 10 }, output: `<br>Duration: 10 seconds` },
      { name: 'Duration -50 ms',        template: { duration: -0.05 }, output: `<br>Duration: -50 milliseconds` },
      { name: 'Duration 0 sec',         template: { duration: -5 }, output: `<br>Duration: 0 seconds` },
      { name: 'Duration 1 week',        template: { duration: (3600 * 24 * 7) }, output: `<br>Duration: 1 week` },
      { name: 'Duration 1 month',       template: { duration: 3600 * 24 * 30 }, output: `<br>Duration: 1 month` },
      { name: 'Duration 1 year',        template: { duration: 3600 * 24 * 364 }, output: `<br>Duration: 1 year` },
      { name: 'Duration (real time)',   template: { duration: 1020, flagsCustom: 1 }, output: `<br>Duration: 17 minutes (real time)` },
    ];

    for (const { name, template, output } of cases) {

      it(`Case ${name}`, async() => {
        expect(await service.calculatePreview(template as ItemTemplate)).toEqual(output);
      });
    }

});
