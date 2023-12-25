import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { QueryForm } from '@keira-types/general';
import { Injectable } from '@angular/core';
import { BaseQueryService } from '@keira-shared/services/query/base-query.service';

describe('BaseQueryService', () => {

  @Injectable({
    providedIn: 'root',
  })
  class TestQueryService extends BaseQueryService {
    query(queryString: string) {
      return of([]);
    };
  }

  beforeEach(() =>
    TestBed.configureTestingModule({}),
  );

  const setup = () => {
    const service = TestBed.inject(TestQueryService);
    return { service };
  };

  describe('queryValue()', () => {
    it(
      'should correctly work',
      waitForAsync(async () => {
        const { service } = setup();
        const value = 'mock result value';
        spyOn(service, 'query').and.returnValue(of([{ v: value }]));
        const query = 'SELECT something AS v FROM my_table WHERE index = 123';

        expect(await service.queryValueToPromise(query)).toEqual(value);
        expect(service.query).toHaveBeenCalledTimes(1);
        expect(service.query).toHaveBeenCalledWith(query);
      }),
    );

    it(
      'should be safe in case of no results',
      waitForAsync(async () => {
        const { service } = setup();
        spyOn(service, 'query').and.returnValue(of([]));
        const query = 'SELECT something AS v FROM my_table WHERE index = 123';

        expect(await service.queryValueToPromise(query)).toEqual(null);
        expect(service.query).toHaveBeenCalledTimes(1);
        expect(service.query).toHaveBeenCalledWith(query);
      }),
    );
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

      expect(service.getSearchQuery(table, queryForm)).toEqual(
        'SELECT * ' + "FROM `my_keira3`",
      );
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
  });
});
