import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import { MysqlError } from 'mysql';
import Spy = jasmine.Spy;

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { MockEditorService, MockEntity } from '../../test-utils/mock-services';
import { EditorService } from './editor.service';

describe('EditorService', () => {
  let service: EditorService<MockEntity>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(MockEditorService);
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

    beforeEach(() => {
      selectAllSpy = spyOn(TestBed.get(QueryService), 'selectAll');
    });

    it('TODO', () => {

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
      expect(service['_loading']).toBe(false);
    });

    it('should correctly work when the query succeeds', () => {
      service['_error'] = { code: 'some previous error', errno: 123 } as MysqlError;
      querySpy.and.returnValue(of('mock result'));

      service.save(query);

      expect(querySpy).toHaveBeenCalledWith(query);
      expect(reloadSpy).toHaveBeenCalledWith(service['loadedEntityId']);
      expect(service['_loading']).toBe(false);
      expect(service['_error']).toBe(null);
    });

    it('should correctly work when the query errors', () => {
      const error = { code: 'some error', errno: 1234 } as MysqlError;
      querySpy.and.returnValue(throwError(error));

      service.save(query);

      expect(querySpy).toHaveBeenCalledWith(query);
      expect(reloadSpy).toHaveBeenCalledTimes(0);
      expect(service['_loading']).toBe(false);
      expect(service['_error']).toEqual(error);
    });
  });
});
