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
import { ITEM_FLAG } from '@keira-shared/constants/flags/item-flags';
import { ITEM_TYPE } from '@keira-shared/constants/options/item-class';

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

    const mockItemNameById = 'mockItemNameById';
    const mockGetSpellNameById = 'mockGetSpellNameById';
    const mockGetSpellDescriptionById = 'mockGetSpellDescriptionById';
    const mockGetFactionNameById = 'mockGetFactionNameById';
    const mockGetLockById: Lock[] = [null];
    const mockGetMapNameById = 'mockGetMapNameById';
    const mockGetAreaNameById = 'mockGetAreaNameById';
    const mockGetEventNameByHolidayId = 'mockGetEventNameByHolidayId';
    const mockGetSocketBonusById = 'mockGetSocketBonusById';

    const lockData1 = {
      id: 1, type1: 1, type2: 1, type3: 2, type4: 2, type5: 0,
      properties1: 1, properties2: 0, properties3: 1, properties4: 0, properties5: 0,
      reqSkill1: 0, reqSkill2: 0, reqSkill3: 1, reqSkill4: 0, reqSkill5: 0
    };
    const lockData2 = {
      id: 2, type1: 2, type2: 2, type3: 2, type4: 2, type5: 2,
      properties1: 25, properties2: 1, properties3: 1, properties4: 1, properties5: 0,
      reqSkill1: 0, reqSkill2: 1, reqSkill3: 1, reqSkill4: 0, reqSkill5: 0
    };

    const locksData = [
      [mockGetLockById],
      [lockData2],
      [lockData1],
      [null],
    ];

    const npcVendor1 = [
      { item: 123, entry: 123, eventId: 0, maxcount: 0, extendedCost: 123 },
      { item: 123, entry: 123, eventId: 0, maxcount: 0, extendedCost: 123 },
    ] as any;
    const npcVendor2 = [
      { item: 123, entry: 123, eventId: 0, maxcount: 0, extendedCost: null },
    ];

    const vendorData = [
      null,
      [npcVendor1],
      [npcVendor2],
    ];

    const itemEtendedCost = [
      {
        id: 123, reqHonorPoints: 20, reqArenaPoints: 4670, reqArenaSlot: 1,
        reqItemId1: 1, reqItemId2: 2, reqItemId3: 3, reqItemId4: 4, reqItemId5: 5,
        itemCount1: 6, itemCount2: 7, itemCount3: 8, itemCount4: 9, itemCount5: 10,
        reqPersonalRating: 2200,
      },
      {
        id: 123, reqHonorPoints: 20, reqArenaPoints: 4670, reqArenaSlot: 1,
        reqItemId1: 1, reqItemId2: 2, reqItemId3: 3, reqItemId4: 4, reqItemId5: 5,
        itemCount1: 6, itemCount2: 7, itemCount3: 8, itemCount4: 9, itemCount5: 10,
        reqPersonalRating: 2200,
      },
    ] as any;

    // items and itemset
    const mockItems1 = [
      { id: 123, slotBak: 1, itemset: 123 },
      { id: 124, slotBak: 2, itemset: 123 },
      { id: 125, slotBak: 3, itemset: 123 },
      { id: 126, slotBak: 4, itemset: 123 },
      { id: 127, slotBak: 5, itemset: 123 },
      { id: 128, slotBak: 6, itemset: 123 },
      { id: 129, slotBak: 1, itemset: 123 },
      { id: 130, slotBak: 2, itemset: 123 },
      { id: 131, slotBak: 3, itemset: 123 },
      { id: 132, slotBak: 4, itemset: 123 },
      { id: 133, slotBak: 5, itemset: 123 },
      { id: 134, slotBak: 6, itemset: 123 },
    ];

    const mockItems2 = [
      { id: 135, slotBak: 1, itemset: 138 },
      { id: 136, slotBak: 2, itemset: 138 },
      { id: 137, slotBak: 1, itemset: 138 },
      { id: 138, slotBak: 2, itemset: 138 },
    ];
    const mockItems3 = [{ id: 150, slotBak: 1, itemset: 150 }];
    const mockItems4 = [{ id: 152, slotBak: 1, itemset: 152 }];
    const mockItems5 = [{ id: 153, slotBak: 1, itemset: 153 }, { id: 153, slotBak: 2, itemset: 153 }];

    const mockItemset1 = { id: 123, name: 'Helias itemset', spell1: 1, bonus1: 2, bonus2: 1, skillId: 1, skillLevel: 1 };
    const mockItemset2 = { id: 123, name: 'Shin itemset',   spell1: 1, spell2: 2, skillId: 1 };
    const mockItemset3 = { id: 123, name: 'Kalhac itemset' };
    const mockItemset4 = { id: 123, name: null };

    const id = 123;

    beforeEach(() => {
      mysqlQueryService = TestBed.inject(MysqlQueryService);
      spyOn(mysqlQueryService, 'getItemNameById').and.callFake(i => of(i === 1 ? (mockItemNameById + i) : null).toPromise());
      spyOn(mysqlQueryService, 'query').and.callFake((i) => {

        if (i.indexOf('npc_vendor') > -1 && i.indexOf('123') > -1) {
          return of(npcVendor1);
        }

        if (i.indexOf('SELECT name FROM item_template') > -1) {
          if (i.indexOf('153') > -1) { return of(null); }

          if (i.indexOf('123') > -1) {
            const itemsName = [{ name: '' }].concat(Array.from(new Array(11), (_, idx) => ({ name: 'Helias Item' + idx })));
            return of(itemsName);
          }

          if (i.indexOf('138') > -1 || i.indexOf('150') > -1) { return of(Array.from(new Array(1), () => ({ name: 'Shin Item' }))); }
          if (i.indexOf('152') > -1) { return of([{ name: null }]); }
        }

        return of(null);
      });

      sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'getSpellNameById').and.callFake(i => of(mockGetSpellNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getSpellDescriptionById').and.callFake(i => of(mockGetSpellDescriptionById + i).toPromise());
      spyOn(sqliteQueryService, 'getFactionNameById').and.callFake(i => of(mockGetFactionNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getMapNameById').and.callFake(i => of(mockGetMapNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getAreaNameById').and.callFake(i => of(mockGetAreaNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getEventNameByHolidayId').and.callFake(i => of(mockGetEventNameByHolidayId + i).toPromise());
      spyOn(sqliteQueryService, 'getSocketBonusById').and.callFake(i => of(mockGetSocketBonusById + i).toPromise());
      spyOn(sqliteQueryService, 'getLockById').and.callFake(i => of(locksData[i]).toPromise());
      spyOn(sqliteQueryService, 'getSkillNameById').and.callFake(i => of(i === 1 ? 'profession' : null).toPromise());
      spyOn(sqliteQueryService, 'query').and.callFake((i) => {

        // TODO: improve extended cost cases
        if (i.indexOf('item_extended_cost') > -1) {
          if (i.indexOf('123') > -1) {
            return of(itemEtendedCost);
          }

          return of([]);
        }

        if (i.indexOf('SELECT * FROM items ') > -1) {
          if (i.indexOf('123') > -1) { return of(mockItems1); }
          if (i.indexOf('138') > -1 || i.indexOf('140') > -1) { return of(mockItems2); }
          if (i.indexOf('150') > -1 || i.indexOf('151') > -1) { return of(mockItems3); }
          if (i.indexOf('152') > -1) { return of(mockItems4); }
          if (i.indexOf('153') > -1) { return of(mockItems5); }
        }

        if (i.indexOf('SELECT * FROM itemset WHERE id = ') > -1) {
          if (i.indexOf('id = 123') > -1) { return of(mockItemset1); }
          if (i.indexOf('id = 138') > -1) { return of(mockItemset2); }
          if (i.indexOf('id = 140') > -1) { return of(mockItemset3); }
          if (i.indexOf('id = 150') > -1 || i.indexOf('id = 153') > -1) { return of(mockItemset4); }
        }

        return of(null);
      });

      service = TestBed.inject(ItemPreviewService);
    });

    it('getItemExtendedCostFromVendor', () => {
      service['getItemExtendedCostFromVendor'](123);
      expect(mysqlQueryService.query).toHaveBeenCalledTimes(1);
    });

    it('getItemsetSlotBak', () => {
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
      service['getItemsetById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM itemset WHERE id = ${id}`);
    });

    it('getItemLimitCategoryById', () => {
      service['getItemLimitCategoryById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT * FROM item_limit_category WHERE id = ${id}`);
    });

    it('getGemEnchantmentIdById', () => {
      service['getGemEnchantmentIdById'](id);
      expect(sqliteQueryService.query).toHaveBeenCalledTimes(1);
      expect(sqliteQueryService.query).toHaveBeenCalledWith(`SELECT gemEnchantmentId AS v FROM items WHERE id = ${id};`);
    });

    it('getItemEnchantmentById', () => {
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
      { name: 'RandomProperty',   template: { RandomProperty: 1 }, output: `<br><!--randEnchant--><span class="q2">&lt;Random enchantment&gt</span>` },
      { name: 'RandomSuffix',     template: { RandomSuffix: 1 }, output: `<br><!--randEnchant--><span class="q2">&lt;Random enchantment&gt</span>` },
      { name: 'Durability',       template: { MaxDurability: 100 }, output: `<br>Durability 100 / 100` },
      { name: 'Sell Price',       template: { SellPrice: 123456 }, output: `<br>Sell Price: <span class="moneygold">12</span> &nbsp;<span class="moneysilver">34</span> &nbsp;<span class="moneycopper">56</span> &nbsp;` },
      { name: 'Sell Price-1',     template: { SellPrice: 9999 }, output: `<br>Sell Price: <span class="moneysilver">99</span> &nbsp;<span class="moneycopper">99</span> &nbsp;` },
      { name: 'Sell Price-2',     template: { SellPrice: 99 }, output: `<br>Sell Price: <span class="moneycopper">99</span> &nbsp;` },
      { name: 'Sell Price-3',     template: { SellPrice: -1 }, output: `` },
      { name: 'Stats 1',          template: { stat_type1: 1, stat_value1: 1 }, output: `<br><span><!--stat1-->+1 Health</span>` },
      { name: 'Stats -1',         template: { stat_type1: 1, stat_value1: -1 }, output: `<br><span><!--stat1-->-1 Health</span>` },
      { name: 'Stats type null',  template: { stat_type1: 8, stat_value1: 1 }, output: `` },
      { name: 'Stats 12, ReqLvL', template: { stat_type1: 12, stat_value1: 1, RequiredLevel: 71 }, output: `<br>Requires Level 71<br><!--bonus--><span class="q2">Equip: Increases defense rating by <!--rtg12-->1&nbsp;<small>(<!--rtg%12-->0.39&nbsp;@&nbsp;L<!--lvl-->71)</small>.</span>` },
      { name: 'Stats 13, ReqLvL', template: { stat_type1: 13, stat_value1: 1, RequiredLevel: 71 }, output: `<br>Requires Level 71<br><!--bonus--><span class="q2">Equip: Increases your dodge rating by <!--rtg13-->1&nbsp;<small>(<!--rtg%13-->0.04%&nbsp;@&nbsp;L<!--lvl-->71)</small>.</span>` },
      { name: 'Stats 13, ReqLvL', template: { stat_type1: 13, stat_value1: 1, RequiredLevel: 61 }, output: `<br>Requires Level 61<br><!--bonus--><span class="q2">Equip: Increases your dodge rating by <!--rtg13-->1&nbsp;<small>(<!--rtg%13-->0.07%&nbsp;@&nbsp;L<!--lvl-->61)</small>.</span>` },
      { name: 'Stats 13, ReqLvL', template: { stat_type1: 13, stat_value1: 1, RequiredLevel: 11 }, output: `<br>Requires Level 11<br><!--bonus--><span class="q2">Equip: Increases your dodge rating by <!--rtg13-->1&nbsp;<small>(<!--rtg%13-->0.14%&nbsp;@&nbsp;L<!--lvl-->34)</small>.</span>` },
      { name: 'Stats 16, ReqLvL', template: { stat_type1: 16, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><!--bonus--><span class="q2">Equip: Improves melee hit rating by <!--rtg16-->1&nbsp;<small>(<!--rtg%16-->2.60%&nbsp;@&nbsp;L<!--lvl-->8)</small>.</span>` },
      { name: 'Stats 38, ReqLvL', template: { stat_type1: 38, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><!--bonus--><span class="q2">Equip: Increases attack power by <!--rtg38-->1.</span>` },
      { name: 'Stats 48, ReqLvL', template: { stat_type1: 48, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><!--bonus--><span class="q2">Equip: Increases the block value of your shield by <!--rtg48-->1.</span>` },
      { name: 'Stats 39, ReqLvL', template: { stat_type1: 39, stat_value1: 1, RequiredLevel: 8 }, output: `<br>Requires Level 8<br><!--bonus--><span class="q2">Equip: Increases ranged attack power by <!--rtg39-->1&nbsp;<small>(<!--rtg%39-->%&nbsp;@&nbsp;L<!--lvl-->8)</small>.</span>` },
      { name: 'AllowableClass Paladin', template: { AllowableClass: 2 }, output: `<br>Classes: <span class="c2">Paladin</span>` },
      { name: 'AllowableClass All',     template: { AllowableClass: -1 }, output: `` },
      { name: 'AllowableRace All',      template: { AllowableRace: -1 }, output: `` },
      { name: 'AllowableRace Alliance', template: { AllowableRace: 1101 }, output: `<br>Races: Alliance` },
      { name: 'AllowableRace Horde',    template: { AllowableRace: 690 }, output: `<br>Races: Horde` },
      { name: 'AllowableRace Human',    template: { AllowableRace: 1 }, output: `<br>Races: Human` },
      { name: 'AllowableRace Orc',      template: { AllowableRace: 2 }, output: `<br>Races: Orc` },
      { name: 'Duration 1 day',         template: { duration: 3600 * 24 }, output: `<br>Duration: 1 day` },
      { name: 'Duration 2 days',        template: { duration: 3600 * 24 * 2 }, output: `<br>Duration: 2 days` },
      { name: 'Duration 1 hour',        template: { duration: 3600 }, output: `<br>Duration: 1 hour` },
      { name: 'Duration 2 hours',       template: { duration: 3600 * 2 }, output: `<br>Duration: 2 hours` },
      { name: 'Duration 1 minute',      template: { duration: 60 }, output: `<br>Duration: 1 minute` },
      { name: 'Duration 2 minutes',     template: { duration: 60 * 2 }, output: `<br>Duration: 2 minutes` },
      { name: 'Duration 1 seconds',     template: { duration: 1 }, output: `<br>Duration: 1 second` },
      { name: 'Duration 10 secs',       template: { duration: 10 }, output: `<br>Duration: 10 seconds` },
      { name: 'Duration -1 ms',         template: { duration: 0.001 }, output: `<br>Duration: 1 millisecond` },
      { name: 'Duration -1 ms',         template: { duration: -0.001 }, output: `<br>Duration: -1 millisecond` },
      { name: 'Duration -50 ms',        template: { duration: -0.05 }, output: `<br>Duration: -50 milliseconds` },
      { name: 'Duration 0 sec',         template: { duration: -5 }, output: `<br>Duration: 0 seconds` },
      { name: 'Duration 1 week',        template: { duration: (3600 * 24 * 7) }, output: `<br>Duration: 1 week` },
      { name: 'Duration 2 weeks',       template: { duration: (3600 * 24 * 7 * 2) }, output: `<br>Duration: 2 weeks` },
      { name: 'Duration 1 month',       template: { duration: 3600 * 24 * 30 }, output: `<br>Duration: 1 month` },
      { name: 'Duration 2 months',      template: { duration: 3600 * 24 * 30 * 2 }, output: `<br>Duration: 2 months` },
      { name: 'Duration 1 year',        template: { duration: 3600 * 24 * 364 }, output: `<br>Duration: 1 year` },
      { name: 'Duration 2 years',       template: { duration: 3600 * 24 * 364 * 2 }, output: `<br>Duration: 2 years` },
      { name: 'Duration (real time)',   template: { duration: 1020, flagsCustom: 1 }, output: `<br>Duration: 17 minutes (real time)` },
      { name: 'Feral Attack Power 1',   template: {
        dmg_min1: 10, dmg_min2: 10, dmg_max1: 10, dmg_max2: 10, delay: 1000, class: 10
      }, output: `<br><!--dmg-->10 Damage+ 10 Damage` },
      { name: 'Feral Attack Power 2', template: {
        dmg_min1: 10, dmg_min2: 10, dmg_max1: 10, dmg_max2: 10, delay: 1000, class: 2, subclass: 2
      }, output: `<table style="float: left; width: 100%;"><tr><th>Bow</th></tr></table><!--dmg--><table style="float: left; width: 100%;"><tr><td>10 Damage</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><th style="text-align: right;">Speed <!--spd-->1.00</th></tr></table>+ 10 Damage<br><!--dps-->(20.00 damage per second)` },
      { name: 'Feral Attack Power 3', template: {
        dmg_min1: 100, dmg_min2: 100, dmg_max1: 500, dmg_max2: 500, delay: 1000, class: 2, subclass: 5
      }, output: `<table style="float: left; width: 100%;"><tr><th>Mace</th></tr></table><!--dmg--><table style="float: left; width: 100%;"><tr><td>100 - 500 Damage</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><th style="text-align: right;">Speed <!--spd-->1.00</th></tr></table>+ 100 - 500 Damage<br><!--dps-->(600.00 damage per second)<br><span class="c11"><!--fap-->(7633 Feral Attack Power)</span>` },
      { name: 'Feral Attack Power 4', template: {
        dmg_min1: 1, dmg_min2: 1, dmg_max1: 5, dmg_max2: 5, delay: 1000, class: 2, subclass: 5
      }, output: `<table style="float: left; width: 100%;"><tr><th>Mace</th></tr></table><!--dmg--><table style="float: left; width: 100%;"><tr><td>1 - 5 Damage</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><th style="text-align: right;">Speed <!--spd-->1.00</th></tr></table>+ 1 - 5 Damage<br><!--dps-->(6.00 damage per second)` },
      { name: 'Spell ID 1', template: { spellid_1: 1, spellid_2: 1 }, output: `<br><!--bonus--><span class="q2">${mockGetSpellDescriptionById}1</span>` },
      { name: 'Spell ID 2', template: { spellid_2: 1 }, output: `<br><!--bonus--><span class="q2">${mockGetSpellDescriptionById}1</span>` },
      { name: 'Spell ID 483', template: { spellid_1: 483 },
        output: `<br><!--bonus--><span class="q2">${mockGetSpellDescriptionById}483</span>`
      },
      { name: 'Spell ID 55884', template: { spellid_1: 55884 },
        output: `<br><!--bonus--><span class="q2">${mockGetSpellDescriptionById}55884</span>`
      },
      { name: 'LockId 1', template: { Flags: 1, lockid: 1 }, output: `<br><span class="q0">Locked<br>Requires Lockpicking (1)<br>Requires Lockpicking (1)<br>Requires Lockpicking</span>` },
      { name: 'LockId 2', template: { Flags: 1, lockid: 2 }, output: `<br><span class="q0">Locked<br>Requires mockItemNameById1<br>Requires Lockpicking (1)</span>` },
      { name: 'LockId 3', template: { Flags: 1, lockid: 3 }, output: `` },
      { name: 'LockId 4', template: { Flags: ITEM_FLAG.OPENABLE, lockid: 3 }, output: `<br><!--lockData--><span class="q2">&lt;Right Click To Open&gt</span>` },
      { name: 'Req HonorRank', template: { requiredhonorrank: 1 }, output: `<br>Requires Private / Scout` },
      { name: 'Req Level Range', template: { Quality: ITEMS_QUALITY.HEIRLOOM, Flags: ITEM_FLAG.ACCOUNTBOUND }, output: `<br><!-- bonding[0] -->Binds to account<br>Requires level 1 to 80 (80)` },

      { name: 'Extended Cost empty', template: { entry: 1  }, output: `` },
      { name: 'Extended Cost', template: { entry: 123, flagsExtra: 0x04, BuyPrice: 1234 }, output: `<br>Requires personal and team arena rating of 2200 in 3v3 or 5v5 brackets`},
      { name: 'Extended Cost', template: { entry: 123 }, output: ``}, // TODO

      { name: 'Damage 1', template: {
        class: ITEM_TYPE.AMMUNITION, dmg_min1: 10, dmg_min2: 10, dmg_max1: 10, dmg_max2: 10, delay: 1000,
      }, output: `<table style="float: left; width: 100%;"><tr><th></th></tr></table>Adds 20 damage per second` },
      { name: 'Damage 2', template: {
        class: ITEM_TYPE.AMMUNITION, dmg_min1: 10, dmg_min2: 10, dmg_max1: 10, dmg_max2: 10, delay: 1000, dmg_type1: 1,
      }, output: `<table style="float: left; width: 100%;"><tr><th></th></tr></table>Adds 20 %s damage per secondHoly` },
      { name: 'Damage 3', template: {
        dmg_min1: 10, dmg_min2: 10, dmg_max1: 10, dmg_max2: 10, delay: 1000, dmg_type1: 1, dmg_type2: 2,
      }, output: `<br><!--dmg-->10 Holy Damage+10 Fire Damage` },
      { name: 'Damage 4', template: {
        dmg_min1: 5, dmg_min2: 5, dmg_max1: 10, dmg_max2: 10, delay: 1000, dmg_type1: 1, dmg_type2: 2,
      }, output: `<br><!--dmg-->5 - 10 Holy Damage+5 - 10 Fire Damage` },

      { name: 'Itemset full success', template: { itemset: 123, entry: 123 }, output: `<br>Requires personal and team arena rating of 2200 in 3v3 or 5v5 brackets<br><br><span class="q">Helias itemset (0/12)</span><br>Requires profession (1)<br><div class="q0" style="padding-left: .6em"><br>Helias Item0<br>Helias Item1<br>Helias Item2<br>Helias Item3<br>Helias Item4<br>Helias Item5<br>Helias Item6<br>Helias Item7<br>Helias Item8<br>Helias Item9<br>Helias Item10</div><span class="q0"><br><span>(2) Set: mockGetSpellDescriptionById1</span></span>` },
      { name: 'Itemset, items < 10, no skillLevel', template: { itemset: 138 }, output: `<br><br><span class="q">Shin itemset (0/1)</span><br>Requires profession<br><div class="q0" style="padding-left: .6em">Shin Item</div>` },
      { name: 'Itemset - no bonus and skill', template: { itemset: 140 }, output: `<br><br><span class="q">Kalhac itemset (0/1)</span><br><div class="q0" style="padding-left: .6em">Shin Item</div>` },
      { name: 'Itemset - no itemset name', template: { itemset: 150, }, output: `<br><br><span class="q"> (0/1)</span><br><div class="q0" style="padding-left: .6em">Shin Item</div>` },
      { name: 'Itemset - no itemset', template: { itemset: 151, }, output: `` },
      { name: 'Itemset - itemsName with null name', template: { itemset: 152, }, output: `` },
      { name: 'Itemset - no itemsName', template: { itemset: 153, }, output: `` },
      { name: 'Itemset - no itemsetPieces', template: { itemset: 154, }, output: `` },
    ];

    for (const { name, template, output } of cases) {
      it(`Case ${name}`, async() => {
        expect(await service.calculatePreview(template as ItemTemplate)).toEqual(output);
      });
    }

});
