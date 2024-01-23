import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { SqliteQueryService } from './sqlite-query.service';

describe('SqliteQueryService', () => {
  let service: SqliteQueryService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteQueryService);
  }));

  describe('queryValue()', () => {
    it('should correctly work', waitForAsync(async () => {
      const value = 'mock result value';
      spyOn(service, 'query').and.returnValue(of([{ v: value }]));
      const query = 'SELECT something AS v FROM my_table WHERE index = 123';

      service.queryValue(query).subscribe((result) => {
        expect(result).toEqual(value);
      });
      expect(service.query).toHaveBeenCalledOnceWith(query);
    }));

    it('should be safe in case of no results', waitForAsync(async () => {
      spyOn(service, 'query').and.returnValue(of(null));
      const query = 'SELECT something AS v FROM my_table WHERE index = 123';

      service.queryValue(query).subscribe((result) => {
        expect(result).toEqual(null);
      });
      expect(service.query).toHaveBeenCalledOnceWith(query);
    }));
  });

  describe('get helpers', () => {
    const mockResult = 'mock result';
    const id = '123';

    beforeEach(() => {
      spyOn(service, 'queryValue').and.returnValue(of(mockResult));
      spyOn(service, 'queryValueToPromise').and.returnValue(Promise.resolve(mockResult));
    });

    it('getItemDisplayIdIcon', () => {
      service.getIconByItemDisplayId(id).subscribe((res) => {
        expect(res).toEqual(mockResult);
      });
      service.getIconByItemDisplayId(id).subscribe((res) => {
        expect(res).toEqual(mockResult);
      });
      expect(service.queryValue).toHaveBeenCalledTimes(1);
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT icon AS v FROM display_icons WHERE displayId = ${id}`);
    });

    it('getSpellDisplayIcon', () => {
      service.getIconBySpellDisplayId(id).subscribe((res) => {
        expect(res).toEqual(mockResult);
      });
      service.getIconBySpellDisplayId(id).subscribe((res) => {
        expect(res).toEqual(mockResult);
      });
      expect(service.queryValue).toHaveBeenCalledTimes(1);
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT icon AS v FROM spells_icon WHERE ID = ${id}`);
    });

    it('getDisplayIdBySpellId (case non-null)', () => {
      service.getDisplayIdBySpellId(id).subscribe((res) => {
        expect(res).toEqual(mockResult);
      });
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT spellIconID AS v FROM spells WHERE ID = ${id}`);
      expect(Object.keys(service['cache']).length).toBe(1);
      expect(Object.keys(service['cache'])[0]).toBe('getDisplayIdBySpellId');
    });

    it('getDisplayIdBySpellId (case null)', () => {
      service.getDisplayIdBySpellId(null).subscribe((res) => {
        expect(res).toEqual(null);
      });
      expect(service.queryValue).toHaveBeenCalledTimes(0);
    });

    for (const test of [
      { name: 'getSpellNameById', query: `SELECT spellName AS v FROM spells WHERE id = ${id}` },
      { name: 'getSkillNameById', query: `SELECT name AS v FROM skills WHERE id = ${id}` },
      { name: 'getFactionNameById', query: `SELECT m_name_lang_1 AS v FROM factions WHERE m_ID = ${id}` },
      { name: 'getFactionNameByNameId', query: `SELECT m_name_lang_1 AS v FROM factions WHERE faction_name_id = ${id}` },
      { name: 'getMapNameById', query: `SELECT m_MapName_lang1 AS v FROM maps WHERE m_ID = ${id}` },
      { name: 'getAreaNameById', query: `SELECT m_AreaName_lang AS v FROM areas_and_zones WHERE m_ID = ${id}` },
      { name: 'getEventNameByHolidayId', query: `SELECT name AS v FROM holiday WHERE id = ${id}` },
      { name: 'getSocketBonusById', query: `SELECT name AS v FROM item_enchantment WHERE id = ${id}` },
      { name: 'getSpellDescriptionById', query: `SELECT Description AS v FROM spells WHERE id = ${id}` },
    ]) {
      it(
        test.name,
        waitForAsync(async () => {
          expect(await service[test.name](id)).toEqual(mockResult);
          expect(await service[test.name](id)).toEqual(mockResult); // check cache
          expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
          expect(service.queryValue).toHaveBeenCalledWith(test.query);
          expect(Object.keys(service['cache']).length).toBe(1);
          expect(Object.keys(service['cache'])[0]).toBe(test.name);
        }),
      );
    }

    it('getLockById', waitForAsync(async () => {
      spyOn(service, 'query').and.returnValue(of([]));
      expect(await service.getLockById(id)).toEqual([]);
      expect(await service.getLockById(id)).toEqual([]); // check cache
      expect(service.query).toHaveBeenCalledTimes(1); // check cache
      expect(service.query).toHaveBeenCalledWith(`SELECT * FROM lock WHERE id = ${id}`);
    }));

    it('getRewardXP', waitForAsync(async () => {
      expect(await service.getRewardXP(id, 2)).toEqual(mockResult);
      expect(await service.getRewardXP(id, 2)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(`SELECT field${Number(id) + 1} AS v FROM questxp WHERE id = 2`);
      expect(Object.keys(service['cache']).length).toBe(1);
      expect(Object.keys(service['cache'])[0]).toBe('getRewardXP');
    }));

    it('getItemExtendedCost', waitForAsync(async () => {
      spyOn(service, 'query').and.returnValue(of([]));
      expect(await service.getItemExtendedCost([])).toEqual([]);
      expect(await service.getItemExtendedCost([])).toEqual([]); // check cache
      expect(service.query).toHaveBeenCalledTimes(1); // check cache
      expect(service.query).toHaveBeenCalledWith(`SELECT * FROM item_extended_cost WHERE id IN ()`);
    }));
  });
});
