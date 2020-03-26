import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemHandlerService } from '../item-handler.service';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { MockedToastrService } from '@keira-shared/testing/mocks';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ItemTemplate } from '@keira-shared/types/item-template.type';
import { Lock } from './item-preview';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { of } from 'rxjs';
import { ITEMS_QUALITY } from '@keira-shared/constants/options/item-quality';
import { ITEM_FLAG } from '@keira-shared/constants/flags/item-flags';

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
      const queryService = TestBed.inject(MysqlQueryService);
      spyOn(queryService, 'getItemNameById').and.callFake(i => of(mockItemNameById + i).toPromise());
      spyOn(queryService, 'query').and.callFake(i => of([]));

      const sqliteQueryService = TestBed.inject(SqliteQueryService);
      spyOn(sqliteQueryService, 'getSpellNameById').and.callFake(i => of(mockGetSpellNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getSpellDescriptionById').and.callFake(i => of(mockGetSpellDescriptionById + i).toPromise());
      spyOn(sqliteQueryService, 'getFactionNameById').and.callFake(i => of(mockGetFactionNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getLockById').and.callFake(i => of(mockGetLockById).toPromise());
      spyOn(sqliteQueryService, 'getMapNameById').and.callFake(i => of(mockGetMapNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getAreaNameById').and.callFake(i => of(mockGetAreaNameById + i).toPromise());
      spyOn(sqliteQueryService, 'getEventNameByHolidayId').and.callFake(i => of(mockGetEventNameByHolidayId + i).toPromise());
      spyOn(sqliteQueryService, 'getSocketBonusById').and.callFake(i => of(mockGetSocketBonusById + i).toPromise());
      spyOn(sqliteQueryService, 'query').and.callFake(i => of([]));
    });

    const cases = [
      { name: 'Empty variables',  template: { }, output: ''  },
      { name: 'Item Name',        template: { name: 'Helias Item' }, output: `<b class="item-name q0">Helias Item</b>` },
      { name: 'All Flags & Quality Epic', template: { Quality: ITEMS_QUALITY.EPIC, Flags: -1 }, output: `<br><!-- ITEM_FLAG.HEROIC --><span class="q2">Heroic</span><br> Conjured Item<br><!-- bonding[0] -->Binds to account<br><!-- uniqueEquipped -->Unique-Equipped` },
      { name: 'Empty variables',  template: { HolidayId: 140 }, output: `<br>Requires ${mockGetEventNameByHolidayId}140` },
      { name: 'StartQuest',       template: { startquest: 1  }, output: `<br><span class="q1">This Item Begins a Quest</span>` },
      { name: 'ContainerSlots',   template: { ContainerSlots: 1  }, output: `<br>1 Slot Bag` },
      { name: 'ContainerSlots-2', template: { ContainerSlots: 1, BagFamily: 2 }, output: `<br>1 Slot Ammo Pouch` },
      { name: 'RandomProperty',   template: { RandomProperty: 1 }, output: `<br><span class="q2">&lt;Random enchantment&gt</span>` },
      { name: 'RandomSuffix',     template: { RandomSuffix: 1 }, output: `<br><span class="q2">&lt;Random enchantment&gt</span>` },
      { name: 'Durability',       template: { MaxDurability: 100 }, output: `<br>Durability 100 / 100` },
      { name: 'Sell Price',       template: { SellPrice: 123456 }, output: `<br>Sell Price: <span class="moneygold">12</span> &nbsp;<span class="moneysilver">34</span> &nbsp;<span class="moneycopper">56</span> &nbsp;` },

    ];

    for (const { name, template, output } of cases) {

      it(`Case ${name}`, async() => {
        const service: ItemPreviewService = TestBed.inject(ItemPreviewService);
        const editorService: ItemTemplateService = TestBed.inject(ItemTemplateService);
        const data = createItem(template);

        editorService['_form'].setValue(data);
        expect(await service.calculatePreview()).toEqual(output);
      });
    }



});
