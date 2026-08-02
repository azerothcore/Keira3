import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { QueryError } from 'mysql2';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira/shared/db-layer';
import { SingleRowComplexKeyEditorService } from './single-row-complex-key-editor.service';

import { getPartial } from '@keira/shared/utils';

import { mockChangeDetectorRef } from '@keira/shared/test-utils';
import { MOCK_NAME, MockEntity, MockHandlerService, MockSingleRowComplexKeyEditorService } from '../../core.mock';

describe('SingleRowComplexKeyEditorService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
      ],
    }),
  );

  function setup() {
    const service: SingleRowComplexKeyEditorService<MockEntity> = TestBed.inject(MockSingleRowComplexKeyEditorService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(() => undefined);
    return { service };
  }

  describe('check methods of class', () => {
    it('get entityIdFields() correctly', () => {
      const { service } = setup();
      expect(service.entityIdFields).toEqual(JSON.parse(service['_entityIdField']));
    });

    it('selecteQuery()', () => {
      const { service } = setup();
      const handlerService = TestBed.inject(MockHandlerService);
      handlerService['_selected'] = '{}';
      const selectAllMultipleKeysSpy = vi
        .spyOn(TestBed.inject(MysqlQueryService), 'selectAllMultipleKeys')
        .mockImplementation(() => undefined);

      service['selectQuery']();

      expect(selectAllMultipleKeysSpy).toHaveBeenCalled();
    });

    it('updateDiffQuery  should correctly work', () => {
      const { service } = setup();
      const getUpdateMultipleKeysQuerySpy = vi
        .spyOn(TestBed.inject(MysqlQueryService), 'getUpdateMultipleKeysQuery')
        .mockImplementation(() => undefined);
      vi.spyOn<any>(service, 'updateEditorStatus').mockImplementation(() => undefined);

      service['updateDiffQuery']();

      expect(getUpdateMultipleKeysQuerySpy).toHaveBeenCalled();
      expect(getUpdateMultipleKeysQuerySpy).toHaveBeenCalledWith(
        service['_entityTable'],
        service['_originalValue'],
        service['_form'].getRawValue(),
        service['entityIdFields'],
      );
      expect(service['updateEditorStatus']).toHaveBeenCalledTimes(1);
    });

    it('updateFullQuery()', () => {
      const { service } = setup();
      const getFullDeleteInsertMultipleKeysQuerySpy = vi
        .spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertMultipleKeysQuery')
        .mockImplementation(() => undefined);

      service['updateFullQuery']();

      expect(getFullDeleteInsertMultipleKeysQuerySpy).toHaveBeenCalled();
    });

    it('updateFullQuery() when isNew is true', () => {
      const { service } = setup();
      const getFullDeleteInsertMultipleKeysQuerySpy = vi
        .spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertMultipleKeysQuery')
        .mockImplementation(() => undefined);
      const handlerService = TestBed.inject(MockHandlerService);
      handlerService['_selected'] = JSON.stringify({ id: 1, guid: 2 });

      service['onCreatingNewEntity']();
      service['updateFullQuery']();

      expect(getFullDeleteInsertMultipleKeysQuerySpy).toHaveBeenCalled();
    });

    it('reload()', () => {
      const { service } = setup();
      const resetSpy = vi.spyOn<any>(service, 'reset').mockImplementation(() => undefined);
      const reloadEntitySpy = vi.spyOn<any>(service, 'reloadEntity').mockImplementation(() => undefined);

      service.reload(mockChangeDetectorRef);

      expect(service['_loading']).toBe(true);
      expect(resetSpy).toHaveBeenCalled();
      expect(reloadEntitySpy).toHaveBeenCalled();
    });

    it('reloadAfterSave()', () => {
      const { service } = setup();
      const selectSpy = vi.spyOn(TestBed.inject(MockHandlerService), 'select').mockImplementation(() => undefined);
      const reloadSpy = vi.spyOn(service, 'reload').mockImplementation(() => undefined);

      service['reloadSameEntity'](mockChangeDetectorRef);

      expect(service['_isNew']).toBe(false);
      expect(reloadSpy).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('reloadEntity()', () => {
      const { service } = setup();
      const selectQuerySpy = vi.spyOn<any>(service, 'selectQuery').mockImplementation(() => undefined);
      const error = { code: 'mock error', errno: 1234 } as QueryError;
      selectQuerySpy.mockReturnValue(of([{ [MOCK_NAME]: 'mockName' }]));

      service['reloadEntity'](mockChangeDetectorRef);

      expect(selectQuerySpy).toHaveBeenCalled();
      expect(service['_loading']).toBe(false);

      selectQuerySpy.mockReturnValue(throwError(error));

      service['reloadEntity'](mockChangeDetectorRef);

      expect(service['_error']).toBe(error);
    });

    it('onCreatingNewEntity()', () => {
      const { service } = setup();
      const handlerService = TestBed.inject(MockHandlerService);
      vi.spyOn(service, 'entityIdFields', 'get').mockReturnValue(['id', 'guid', 'test']);
      handlerService['_selected'] = JSON.stringify({ id: 1, guid: 2 });

      service['onCreatingNewEntity']();

      expect(service['_originalValue']['id']).toBe(1);
      expect(service['_isNew']).toBe(true);
    });

    it('setLoadedEntity()', () => {
      const { service } = setup();
      const selectSpy = vi.spyOn(TestBed.inject(MockHandlerService), 'select').mockImplementation(() => undefined);

      service['_originalValue'] = new MockEntity();
      service['_originalValue'].id = 1;
      service['_originalValue'].guid = 0;

      service['setLoadedEntity']();

      expect(service['_loadedEntityId']).toEqual(JSON.stringify(getPartial(service['_originalValue'], service.entityIdFields)));
      expect(selectSpy).toHaveBeenCalled();
    });

    it('onReloadSuccessful()', () => {
      const { service } = setup();
      const onCreatingNewEntitySpy = vi.spyOn<any>(service, 'onCreatingNewEntity').mockImplementation(() => undefined);
      const updateFormAfterReloadSpy = vi.spyOn<any>(service, 'updateFormAfterReload').mockImplementation(() => undefined);
      const setLoadedEntitySpy = vi.spyOn<any>(service, 'setLoadedEntity').mockImplementation(() => undefined);
      const updateFullQuerySpy = vi.spyOn<any>(service, 'updateFullQuery').mockImplementation(() => undefined);
      const onLoadedExistingEntitySpy = vi.spyOn<any>(service, 'onLoadedExistingEntity').mockImplementation(() => undefined);
      const data: MockEntity[] = [];

      service['onReloadSuccessful'](data);

      expect(updateFormAfterReloadSpy).toHaveBeenCalled();
      expect(setLoadedEntitySpy).toHaveBeenCalled();
      expect(updateFullQuerySpy).toHaveBeenCalled();
      expect(onLoadedExistingEntitySpy).toHaveBeenCalled();

      const handlerService = TestBed.inject(MockHandlerService);
      handlerService.isNew = true;

      service['onReloadSuccessful'](data);

      expect(onCreatingNewEntitySpy).toHaveBeenCalled();
    });
  });
});
