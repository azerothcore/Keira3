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
      expect(await service.getSpellNameById(id)).toEqual(mockResult);
      expect(service.queryValue).toHaveBeenCalledTimes(1);
      expect(service.queryValue).toHaveBeenCalledWith(
        `SELECT spellName AS v FROM spells WHERE id = ${id}`
      );
    });
  });

});
