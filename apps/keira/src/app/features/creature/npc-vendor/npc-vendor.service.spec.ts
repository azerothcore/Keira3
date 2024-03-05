import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IconService, MysqlQueryService, SqliteQueryService } from '@keira/shared/core';
import { ItemExtendedCost } from '@keira/shared/acore-world-model';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/shared/test-utils';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { NpcVendorService } from './npc-vendor.service';

describe('NpcVendorService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        NpcVendorService,
      ],
    }),
  );

  it('should call extendedCostCache', waitForAsync(async () => {
    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const extendedCostCacheSpy = spyOn<any>(service, 'extendedCostCache').and.returnValue(Promise.resolve('mockValue'));
    expect(extendedCostCacheSpy).not.toHaveBeenCalled();

    await service.getItemExtendedCost(1);

    expect(extendedCostCacheSpy).toHaveBeenCalledTimes(1);
  }));

  it('should cache properly the extendedCost', waitForAsync(async () => {
    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const getItemExtendedCostReadableSpy = spyOn<any>(service, 'getItemExtendedCostReadable').and.returnValue(Promise.resolve('mock'));

    expect(service['cache']).toEqual([]);

    const extCost = await service['extendedCostCache'](1);

    expect(getItemExtendedCostReadableSpy).toHaveBeenCalledTimes(1);
    expect(extCost).toBe('mock');
    expect(await service['cache'][1]).toBe('mock');

    getItemExtendedCostReadableSpy.calls.reset();

    await service['extendedCostCache'](1);
    expect(getItemExtendedCostReadableSpy).not.toHaveBeenCalled();
  }));

  it('should parse the ExtendedCost', waitForAsync(async () => {
    const mockItemExtendedCost = {
      id: 1,
      reqHonorPoints: 2,
      reqArenaPoints: 3,
      reqItemId1: 5,
      reqItemId2: 6,
      reqItemId3: 7,
      reqItemId4: 8,
      reqItemId5: 9,
      itemCount1: 10,
      itemCount2: 11,
      itemCount3: 12,
      itemCount4: 13,
      itemCount5: 14,
    } as ItemExtendedCost;
    const mockResult = `<div class="item-extended-cost"><span class="mx-2">2</span>
      <span class="mx-1 alliance side"></span>
      <span class="mx-1 horde side"></span><span class="mx-2">3</span>
      <span class="mx-1 arena side"></span><span class="mx-2">10</span>
      <img src="https://wow.zamimg.com/images/wow/icons/small/inv_gorehowl.jpg"><span class="mx-2">11</span>
      <img src="https://wow.zamimg.com/images/wow/icons/small/inv_gorehowl.jpg"><span class="mx-2">12</span>
      <img src="https://wow.zamimg.com/images/wow/icons/small/inv_gorehowl.jpg"><span class="mx-2">13</span>
      <img src="https://wow.zamimg.com/images/wow/icons/small/inv_gorehowl.jpg"><span class="mx-2">14</span>
      <img src="https://wow.zamimg.com/images/wow/icons/small/inv_gorehowl.jpg"></div>`;

    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const iconService = TestBed.inject(IconService);
    const getItemExtendedCostSpy = spyOn(sqliteQueryService, 'getItemExtendedCost').and.returnValue(
      Promise.resolve([mockItemExtendedCost]),
    );
    const getIconByItemIdSpy = spyOn<any>(iconService, 'getIconByItemId').and.returnValue(of('inv_gorehowl'));

    const resultText = await service['getItemExtendedCostReadable'](1);

    expect(mockResult.replace(/ /g, '')).toBe(resultText.replace(/ /g, ''));
    expect(getItemExtendedCostSpy).toHaveBeenCalledTimes(1);
    expect(getIconByItemIdSpy).toHaveBeenCalledTimes(5);
  }));

  it('should parse the ExtendedCost with partial values', waitForAsync(async () => {
    const mockItemExtendedCost = {
      id: 1,
      reqHonorPoints: 0,
      reqArenaPoints: 0,
      reqItemId1: 5,
      reqItemId2: 0,
      reqItemId3: 0,
      reqItemId4: 0,
      reqItemId5: 0,
      itemCount1: 10,
      itemCount2: 0,
      itemCount3: 0,
      itemCount4: 0,
      itemCount5: 0,
    } as ItemExtendedCost;
    const mockResult = `<div class="item-extended-cost"><span class="mx-2">10</span>
      <img src="https://wow.zamimg.com/images/wow/icons/small/inv_misc_questionmark.jpg"></div>`;

    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const iconService = TestBed.inject(IconService);
    const getItemExtendedCostSpy = spyOn(sqliteQueryService, 'getItemExtendedCost').and.returnValue(
      Promise.resolve([mockItemExtendedCost]),
    );
    const getIconByItemIdSpy = spyOn<any>(iconService, 'getIconByItemId').and.returnValue(of(''));

    const resultText = await service['getItemExtendedCostReadable'](1);

    expect(mockResult.replace(/ /g, '')).toBe(resultText.replace(/ /g, ''));
    expect(getItemExtendedCostSpy).toHaveBeenCalledTimes(1);
    expect(getIconByItemIdSpy).toHaveBeenCalledTimes(1);
  }));

  it('should parse the ExtendedCost with empty values', waitForAsync(async () => {
    const mockResult = `<div class="item-extended-cost"></div>`;
    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const iconService = TestBed.inject(IconService);
    const getItemExtendedCostSpy = spyOn(sqliteQueryService, 'getItemExtendedCost').and.returnValue(Promise.resolve([]));
    const getIconByItemIdSpy = spyOn<any>(iconService, 'getIconByItemId').and.returnValue(of(null));

    const resultText = await service['getItemExtendedCostReadable'](2);

    expect(mockResult).toBe(resultText);
    expect(getItemExtendedCostSpy).toHaveBeenCalledTimes(1);
    expect(getIconByItemIdSpy).not.toHaveBeenCalled();
  }));
});
