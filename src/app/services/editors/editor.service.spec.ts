import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import { MysqlError } from 'mysql';
import Spy = jasmine.Spy;

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { MockSingleRowEditorService, MockEntity } from '../../test-utils/mock-services';
import { EditorService } from './editor.service';

describe('EditorService', () => {
  let service: EditorService<MockEntity>;

  const error = { code: 'some error', errno: 1234 } as MysqlError;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(MockSingleRowEditorService);
  });

  it('after creating, the fields should correctly set', () => {
    expect(service['fields']).toEqual([
      'id',
      'guid',
      'name',
    ]);
  });

  describe('reload', () => {
    let selectAllSpy: Spy;
    let formResetSpy: Spy;
    let onReloadSuccessfulSpy: Spy;

    const id = 123456;
    const data = 'mock data result';

    beforeEach(() => {
      selectAllSpy = spyOn(TestBed.get(QueryService), 'selectAll');
      formResetSpy = spyOn(service.form, 'reset');
      onReloadSuccessfulSpy = spyOn(TestBed.get(MockSingleRowEditorService), 'onReloadSuccessful');
    });

    it('should behave correctly when the query succeeds', () => {
      service['_error'] = { code: 'some previous error', errno: 123 } as MysqlError;
      service['_fullQuery'] = '-- some previous query';
      service['_diffQuery'] = '-- some previous query';
      selectAllSpy.and.returnValue(of(data));

      service.reload(id);

      expect(service.loading).toBe(false);
      expect(service.error).toBe(null);
      expect(service.fullQuery).toBe('');
      expect(service.diffQuery).toBe('');
      expect(selectAllSpy).toHaveBeenCalledWith(service.entityTable, service['_entityIdField'], id);
      expect(formResetSpy).toHaveBeenCalledTimes(1);
      expect(onReloadSuccessfulSpy).toHaveBeenCalledWith(data, id);
    });

    it('should behave correctly when the query errors', () => {
      service['_fullQuery'] = '-- some previous query';
      service['_diffQuery'] = '-- some previous query';
      selectAllSpy.and.returnValue(throwError(error));

      service.reload(id);

      expect(service.loading).toBe(false);
      expect(service.error).toEqual(error);
      expect(service.fullQuery).toBe('');
      expect(service.diffQuery).toBe('');
      expect(selectAllSpy).toHaveBeenCalledWith(service.entityTable, service['_entityIdField'], id);
      expect(formResetSpy).toHaveBeenCalledTimes(1);
      expect(onReloadSuccessfulSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('save', () => {
    let querySpy: Spy;
    let reloadSpy: Spy;

    const query = '-- Mock Query';

    beforeEach(() => {
      querySpy = spyOn(TestBed.get(QueryService), 'query');
      reloadSpy = spyOn(service, 'reload');
    });

    it('should do nothing if the query is null', () => {
      service.save(null);

      expect(querySpy).toHaveBeenCalledTimes(0);
      expect(reloadSpy).toHaveBeenCalledTimes(0);
      expect(service.loading).toBe(false);
    });

    it('should correctly work when the query succeeds', () => {
      service['_error'] = { code: 'some previous error', errno: 123 } as MysqlError;
      querySpy.and.returnValue(of('mock result'));

      service.save(query);

      expect(querySpy).toHaveBeenCalledWith(query);
      expect(reloadSpy).toHaveBeenCalledWith(service.loadedEntityId);
      expect(service.loading).toBe(false);
      expect(service.error).toBe(null);
    });

    it('should correctly work when the query errors', () => {
      querySpy.and.returnValue(throwError(error));

      service.save(query);

      expect(querySpy).toHaveBeenCalledWith(query);
      expect(reloadSpy).toHaveBeenCalledTimes(0);
      expect(service.loading).toBe(false);
      expect(service.error).toEqual(error);
    });
  });
});
