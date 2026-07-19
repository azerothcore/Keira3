import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { QueryError } from 'mysql2';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorService } from './editor.service';
import { mockChangeDetectorRef } from '@keira/shared/test-utils';
import { MockEntity, MockSingleRowEditorService } from '../../core.mock';

describe('EditorService', () => {
  const error = { code: 'some error', errno: 1234 } as QueryError;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
      ],
    }),
  );

  function setup() {
    const service: EditorService<MockEntity> = TestBed.inject(MockSingleRowEditorService);
    return { service };
  }

  it('after creating, the fields should correctly set', () => {
    const { service } = setup();
    expect(service['fields']).toEqual(['id', 'guid', 'name']);
  });

  describe('reload', () => {
    const id = 123456;
    const data = 'mock data result';

    function setupReload() {
      const { service } = setup();
      const selectAllSpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'selectAll').mockImplementation(() => undefined);
      const formResetSpy = vi.spyOn(service.form, 'reset').mockImplementation(() => undefined);
      const onReloadSuccessfulSpy = vi
        .spyOn<any>(TestBed.inject(MockSingleRowEditorService), 'onReloadSuccessful')
        .mockImplementation(() => undefined);
      return { service, selectAllSpy, formResetSpy, onReloadSuccessfulSpy };
    }

    it('should behave correctly when the query succeeds', () => {
      const { service, selectAllSpy, formResetSpy, onReloadSuccessfulSpy } = setupReload();
      service['_error'] = { code: 'some previous error', errno: 123 } as QueryError;
      service['_fullQuery'] = '-- some previous query';
      service['_diffQuery'] = '-- some previous query';
      selectAllSpy.mockReturnValue(of(data as any));
      vi.spyOn<any>(service, 'updateEditorStatus').mockImplementation(() => undefined);

      service.reload(mockChangeDetectorRef, id);

      expect(service.loading).toBe(false);
      expect(service.error).toBe(undefined as any);
      expect(service.fullQuery).toBe('');
      expect(service.diffQuery).toBe('');
      expect(selectAllSpy).toHaveBeenCalledWith(service.entityTable, service['_entityIdField'] as any, id);
      expect(formResetSpy).toHaveBeenCalledTimes(1);
      (expect(onReloadSuccessfulSpy) as any).toHaveBeenCalledWith(data, id);
      expect(service['updateEditorStatus']).toHaveBeenCalledTimes(1);
    });

    it('should behave correctly when the query errors', () => {
      const { service, selectAllSpy, formResetSpy, onReloadSuccessfulSpy } = setupReload();
      service['_fullQuery'] = '-- some previous query';
      service['_diffQuery'] = '-- some previous query';
      selectAllSpy.mockReturnValue(throwError(error));
      vi.spyOn<any>(service, 'updateEditorStatus').mockImplementation(() => undefined);

      service.reload(mockChangeDetectorRef, id);

      expect(service.loading).toBe(false);
      expect(service.error).toEqual(error);
      expect(service.fullQuery).toBe('');
      expect(service.diffQuery).toBe('');
      expect(selectAllSpy).toHaveBeenCalledWith(service.entityTable, service['_entityIdField'] as any, id);
      expect(formResetSpy).toHaveBeenCalledTimes(1);
      expect(onReloadSuccessfulSpy).toHaveBeenCalledTimes(0);
      expect(service['updateEditorStatus']).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    const query = '-- Mock Query';

    function setupSave() {
      const { service } = setup();
      const toastrService = TestBed.inject(ToastrService);
      const toastrSuccessSpy = vi.spyOn(toastrService, 'success').mockImplementation(() => undefined);
      const toastrErrorSpy = vi.spyOn(toastrService, 'error').mockImplementation(() => undefined);
      const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockImplementation(() => undefined);
      const reloadSpy = vi.spyOn(service, 'reload').mockImplementation(() => undefined);
      return { service, toastrSuccessSpy, toastrErrorSpy, querySpy, reloadSpy };
    }

    it('should do nothing if the query is undefined', () => {
      const { service, querySpy, reloadSpy, toastrSuccessSpy, toastrErrorSpy } = setupSave();
      service.save(mockChangeDetectorRef, undefined);

      expect(querySpy).toHaveBeenCalledTimes(0);
      expect(reloadSpy).toHaveBeenCalledTimes(0);
      expect(toastrSuccessSpy).toHaveBeenCalledTimes(0);
      expect(toastrErrorSpy).toHaveBeenCalledTimes(0);
      expect(service.loading).toBe(false);
    });

    it('should correctly work when the query succeeds', () => {
      const { service, querySpy, reloadSpy, toastrSuccessSpy, toastrErrorSpy } = setupSave();
      service['_error'] = { code: 'some previous error', errno: 123 } as QueryError;
      querySpy.mockReturnValue(of('mock result' as any));

      service.save(mockChangeDetectorRef, query);

      expect(querySpy).toHaveBeenCalledWith(query);
      expect(reloadSpy).toHaveBeenCalledWith(mockChangeDetectorRef, service.loadedEntityId);
      expect(toastrSuccessSpy).toHaveBeenCalledTimes(1);
      expect(toastrErrorSpy).toHaveBeenCalledTimes(0);
      expect(service.loading).toBe(false);
      expect(service.error).toBe(undefined as any);
    });

    it('should correctly work when the query errors', () => {
      const { service, querySpy, reloadSpy, toastrSuccessSpy, toastrErrorSpy } = setupSave();
      querySpy.mockReturnValue(throwError(error));

      service.save(mockChangeDetectorRef, query);

      expect(querySpy).toHaveBeenCalledWith(query);
      expect(reloadSpy).toHaveBeenCalledTimes(0);
      expect(toastrSuccessSpy).toHaveBeenCalledTimes(0);
      expect(toastrErrorSpy).toHaveBeenCalledTimes(1);
      expect(service.loading).toBe(false);
      expect(service.error).toEqual(error);
    });
  });
});
