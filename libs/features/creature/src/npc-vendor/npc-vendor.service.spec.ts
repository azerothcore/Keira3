import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ItemExtendedCost, NpcVendor } from '@keira/shared/acore-world-model';

import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { NpcVendorService } from './npc-vendor.service';
import { IconService } from '@keira/shared/base-editor-components';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';

describe('NpcVendorService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        NpcVendorService,
      ],
    }),
  );

  it('should call extendedCostCache', async () => {
    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const extendedCostCacheSpy = vi.spyOn<any>(service, 'extendedCostCache').mockReturnValue(Promise.resolve('mockValue'));
    expect(extendedCostCacheSpy).not.toHaveBeenCalled();

    await service.getItemExtendedCost(1);

    expect(extendedCostCacheSpy).toHaveBeenCalledTimes(1);
  });

  it('should cache properly the extendedCost', async () => {
    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const getItemExtendedCostReadableSpy = vi.spyOn<any>(service, 'getItemExtendedCostReadable').mockReturnValue(Promise.resolve('mock'));

    expect(service['cache']).toEqual([]);

    const extCost = await service['extendedCostCache'](1);

    expect(getItemExtendedCostReadableSpy).toHaveBeenCalledTimes(1);
    expect(extCost).toBe('mock');
    expect(await service['cache'][1]).toBe('mock');

    getItemExtendedCostReadableSpy.mockClear();

    await service['extendedCostCache'](1);
    expect(getItemExtendedCostReadableSpy).not.toHaveBeenCalled();
  });

  it('should parse the ExtendedCost', async () => {
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
    const getItemExtendedCostSpy = vi
      .spyOn(sqliteQueryService, 'getItemExtendedCost')
      .mockReturnValue(Promise.resolve([mockItemExtendedCost]));
    const getIconByItemIdSpy = vi.spyOn<any>(iconService, 'getIconByItemId').mockReturnValue(of('inv_gorehowl'));

    const resultText = await service['getItemExtendedCostReadable'](1);

    expect(mockResult.replace(/ /g, '')).toBe(resultText.replace(/ /g, ''));
    expect(getItemExtendedCostSpy).toHaveBeenCalledTimes(1);
    expect(getIconByItemIdSpy).toHaveBeenCalledTimes(5);
  });

  it('should parse the ExtendedCost with partial values', async () => {
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
    const getItemExtendedCostSpy = vi
      .spyOn(sqliteQueryService, 'getItemExtendedCost')
      .mockReturnValue(Promise.resolve([mockItemExtendedCost]));
    const getIconByItemIdSpy = vi.spyOn<any>(iconService, 'getIconByItemId').mockReturnValue(of(''));

    const resultText = await service['getItemExtendedCostReadable'](1);

    expect(mockResult.replace(/ /g, '')).toBe(resultText.replace(/ /g, ''));
    expect(getItemExtendedCostSpy).toHaveBeenCalledTimes(1);
    expect(getIconByItemIdSpy).toHaveBeenCalledTimes(1);
  });

  it('should parse the ExtendedCost with empty values', async () => {
    const mockResult = `<div class="item-extended-cost"></div>`;
    const service: NpcVendorService = TestBed.inject(NpcVendorService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const iconService = TestBed.inject(IconService);
    const getItemExtendedCostSpy = vi.spyOn(sqliteQueryService, 'getItemExtendedCost').mockReturnValue(Promise.resolve([]));
    const getIconByItemIdSpy = vi.spyOn<any>(iconService, 'getIconByItemId').mockReturnValue(of(null));

    const resultText = await service['getItemExtendedCostReadable'](2);

    expect(mockResult).toBe(resultText);
    expect(getItemExtendedCostSpy).toHaveBeenCalledTimes(1);
    expect(getIconByItemIdSpy).not.toHaveBeenCalled();
  });

  describe('item names', () => {
    const createRow = (item: number): NpcVendor => Object.assign(new NpcVendor(), { item });

    it('getItemName should query each item only once and always return the same promise', async () => {
      const service: NpcVendorService = TestBed.inject(NpcVendorService);
      const getItemNameByIdSpy = vi.spyOn(service.queryService, 'getItemNameById').mockReturnValue(Promise.resolve('Hearthstone'));

      const name = service.getItemName(6948);

      expect(service.getItemName(6948)).toBe(name);
      expect(await name).toBe('Hearthstone');
      expect(getItemNameByIdSpy).toHaveBeenCalledTimes(1);
      expect(getItemNameByIdSpy).toHaveBeenCalledWith(6948);
    });

    it('clearCache should forget the loaded item names so they are queried again', async () => {
      const service: NpcVendorService = TestBed.inject(NpcVendorService);
      const getItemNameByIdSpy = vi.spyOn(service.queryService, 'getItemNameById').mockReturnValue(Promise.resolve('Apple'));
      const clearQueryCacheSpy = vi.spyOn(service.queryService, 'clearCache');
      await service.getItemName(1);

      service.clearCache();

      expect(clearQueryCacheSpy).toHaveBeenCalledTimes(1);
      expect(service.compareItemNames(undefined, undefined, createRow(1), createRow(2))).toBe(0);
      await service.getItemName(1);
      expect(getItemNameByIdSpy).toHaveBeenCalledTimes(2);
    });

    it('compareItemNames should compare the rows by their loaded item names', async () => {
      const service: NpcVendorService = TestBed.inject(NpcVendorService);
      const names: Record<number, string> = { 1: 'Bread', 2: 'Apple' };
      vi.spyOn(service.queryService, 'getItemNameById').mockImplementation((id) => Promise.resolve(names[Number(id)]));
      await service.getItemName(1);
      await service.getItemName(2);

      expect(service.compareItemNames(undefined, undefined, createRow(1), createRow(2))).toBeGreaterThan(0);
      expect(service.compareItemNames(undefined, undefined, createRow(2), createRow(1))).toBeLessThan(0);
      expect(service.compareItemNames(undefined, undefined, createRow(1), createRow(1))).toBe(0);
    });

    it('compareItemNames should put the rows whose name is not loaded first', async () => {
      const service: NpcVendorService = TestBed.inject(NpcVendorService);
      vi.spyOn(service.queryService, 'getItemNameById').mockReturnValue(Promise.resolve('Apple'));
      await service.getItemName(1);

      expect(service.compareItemNames(undefined, undefined, createRow(3), createRow(1))).toBeLessThan(0);
      expect(service.compareItemNames(undefined, undefined, createRow(1), createRow(3))).toBeGreaterThan(0);
    });
  });
});
