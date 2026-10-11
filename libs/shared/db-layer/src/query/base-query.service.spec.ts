import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Service, provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { QueryForm } from '@keira/shared/constants';
import { BaseQueryService } from './base-query.service';

describe('BaseQueryService', () => {
  @Service()
  class TestQueryService extends BaseQueryService {
    query(_queryString: string) {
      return of([]);
    }
  }

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }),
  );

  const setup = () => {
    const service = TestBed.inject(TestQueryService);
    return { service };
  };

  describe('queryValue()', () => {
    it('should correctly work', async () => {
      const { service } = setup();
      const value = 'mock result value';
      vi.spyOn(service, 'query').mockReturnValue(of([{ v: value }]) as any);
      const query = 'SELECT something AS v FROM my_table WHERE index = 123';

      expect(await service.queryValueToPromise(query)).toEqual(value);
      expect(service.query).toHaveBeenCalledExactlyOnceWith(query);
    });

    it('should be safe in case of no results', async () => {
      const { service } = setup();
      vi.spyOn(service, 'query').mockReturnValue(of([]));
      const query = 'SELECT something AS v FROM my_table WHERE index = 123';

      expect(await service.queryValueToPromise(query)).toEqual(null);
      expect(service.query).toHaveBeenCalledExactlyOnceWith(query);
    });
  });

  describe('getSearchQuery()', () => {
    const table = 'my_keira3';

    it('should properly work when fields are empty strings', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: '',
          myField2: '',
        },
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual('SELECT * ' + 'FROM `my_keira3`');
    });

    it('should properly work when using fields', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: 'myValue1',
          myField2: 'myValue2',
        },
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual(
        'SELECT * ' + "FROM `my_keira3` WHERE (`myField1` LIKE '%myValue1%') AND (`myField2` LIKE '%myValue2%')",
      );
    });

    it('should properly work when using fields that contain special characters', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: `The People's Militia`,
          myField2: `Mi illumino d'immenso`,
        },
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual(
        'SELECT * ' +
          "FROM `my_keira3` WHERE (`myField1` LIKE '%The People\\'s Militia%') " +
          "AND (`myField2` LIKE '%Mi illumino d\\'immenso%')",
      );
    });

    it('should properly work when using fields and limit', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: 'myValue1',
          myField2: 'myValue2',
        },
        limit: 20,
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual(
        'SELECT * ' + "FROM `my_keira3` WHERE (`myField1` LIKE '%myValue1%') AND (`myField2` LIKE '%myValue2%') LIMIT 20",
      );
    });

    it('should properly work when using limit only', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          param: null,
        },
        limit: 20,
      };

      expect(service.getSearchQuery(table, queryForm)).toEqual('SELECT * ' + 'FROM `my_keira3` LIMIT 20');
    });

    it('should properly work when using fields, limit, selectFields and groupField', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          myField1: 'myValue1',
          myField2: 'myValue2',
        },
        limit: 20,
      };

      const selectFields = ['sel1', 'sel2'];
      const groupFields = ['sel1', 'sel2', 'sel3'];

      expect(service.getSearchQuery(table, queryForm, selectFields, groupFields)).toEqual(
        'SELECT `sel1`, `sel2` ' +
          "FROM `my_keira3` WHERE (`myField1` LIKE '%myValue1%') AND (`myField2` LIKE '%myValue2%') " +
          'GROUP BY sel1, sel2, sel3 LIMIT 20',
      );
    });

    it('should properly work when using orderFields', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          param: null,
        },
        limit: 50,
      };

      expect(service.getSearchQuery(table, queryForm, null, null, ['myField'])).toEqual(
        'SELECT * ' + 'FROM `my_keira3` ORDER BY myField ASC LIMIT 50',
      );
    });

    it('should properly work when using multiple orderFields', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          param: null,
        },
      };

      expect(service.getSearchQuery(table, queryForm, null, null, ['myField1', 'myField2'])).toEqual(
        'SELECT * ' + 'FROM `my_keira3` ORDER BY myField1 ASC, myField2 ASC',
      );
    });

    it('should append the ascending ORDER BY before the LIMIT', () => {
      const { service } = setup();
      const queryForm: QueryForm<any> = {
        fields: {
          ID: null,
        },
        limit: 50,
      };

      expect(service.getSearchQuery('creature_immunities', queryForm, null, null, ['ID'])).toEqual(
        'SELECT * FROM `creature_immunities` ORDER BY ID ASC LIMIT 50',
      );
    });
  });
});
