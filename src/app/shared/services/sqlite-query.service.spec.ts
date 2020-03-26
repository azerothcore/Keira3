import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { SqliteQueryService } from './sqlite-query.service';

describe('SqliteQueryService', () => {
  let service: SqliteQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteQueryService);
  });

  describe('queryValue()', () => {
    it('should correctly work', async () => {
      const value = 'mock result value';
      spyOn(service, 'query').and.returnValue(of([{ v: value }]));
      const query = 'SELECT something AS v FROM my_table WHERE index = 123';

      service.queryValue(query).subscribe(result => {
        expect(result).toEqual(value);
      });
      expect(service.query).toHaveBeenCalledTimes(1);
      expect(service.query).toHaveBeenCalledWith(query);
    });

    it('should be safe in case of no results', async () => {
      spyOn(service, 'query').and.returnValue(of(null ));
      const query = 'SELECT something AS v FROM my_table WHERE index = 123';

      service.queryValue(query).subscribe(result => {
        expect(result).toEqual(null);
      });
      expect(service.query).toHaveBeenCalledTimes(1);
      expect(service.query).toHaveBeenCalledWith(query);
    });
  });

  describe('get helpers', () => {
    const mockResult = 'mock result';
    const id = '123';

    beforeEach(() => {
      spyOn(service, 'queryValue').and.returnValue(of(mockResult));
    });

    it('getDisplayIdIcon', () => {
      service.getIconByItemDisplayId(id).subscribe(res => {
        expect(res).toEqual(mockResult);
      });
      service.getIconByItemDisplayId(id).subscribe(res => {
        expect(res).toEqual(mockResult);
      });
      expect(service.queryValue).toHaveBeenCalledTimes(1);
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT icon AS v FROM display_icons WHERE displayId = ${id}`
      );
    });

    it('getSpellNameById', async () => {
      expect(await service.getSpellNameById(id)).toEqual(mockResult);
      expect(await service.getSpellNameById(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT spellName AS v FROM spells WHERE id = ${id}`
      );
    });

    it('getSkillNameById', async () => {
      expect(await service.getSkillNameById(id)).toEqual(mockResult);
      expect(await service.getSkillNameById(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT name AS v FROM skills WHERE id = ${id}`
      );
    });

    it('getFactionNameById', async () => {
      expect(await service.getFactionNameById(id)).toEqual(mockResult);
      expect(await service.getFactionNameById(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT m_name_lang_1 AS v FROM factions WHERE m_ID = ${id}`
      );
    });

    it('getMapNameById', async () => {
      expect(await service.getMapNameById(id)).toEqual(mockResult);
      expect(await service.getMapNameById(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT m_MapName_lang1 AS v FROM maps WHERE m_ID = ${id}`
      );
    });

    it('getAreaNameById', async () => {
      expect(await service.getAreaNameById(id)).toEqual(mockResult);
      expect(await service.getAreaNameById(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT m_AreaName_lang AS v FROM areas_and_zones WHERE m_ID = ${id}`
      );
    });

    it('getEventNameByHolidayId', async () => {
      expect(await service.getEventNameByHolidayId(id)).toEqual(mockResult);
      expect(await service.getEventNameByHolidayId(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT name AS v FROM holiday WHERE id = ${id}`
      );
    });

    it('getSocketBonusById', async () => {
      expect(await service.getSocketBonusById(id)).toEqual(mockResult);
      expect(await service.getSocketBonusById(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT name AS v FROM item_enchantment WHERE id = ${id}`
      );
    });

    it('getSpellDescriptionById', async () => {
      expect(await service.getSpellDescriptionById(id)).toEqual(mockResult);
      expect(await service.getSpellDescriptionById(id)).toEqual(mockResult); // check cache
      expect(service.queryValue).toHaveBeenCalledTimes(1); // check cache
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT Description AS v FROM spells WHERE id = ${id}`
      );
    });

    it('getLockById', async () => {
      spyOn(service, 'query').and.returnValue(of([]));
      expect(await service.getLockById(id)).toEqual([]);
      expect(await service.getLockById(id)).toEqual([]); // check cache
      expect(service.query).toHaveBeenCalledTimes(1); // check cache
      expect(service.query).toHaveBeenCalledWith(`SELECT * FROM lock WHERE id = ${id}`);
    });
  });

});
