import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MysqlError } from 'mysql';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { QueryService } from '../query.service';
import { MockedQueryService, MockedToastrService } from '../../test-utils/mocks';
import { SingleRowComplexKeyEditorService } from './single-row-complex-key-editor.service';
import { MockSingleRowComplexKeyEditorService, MockEntity, MockHandlerService, MOCK_NAME } from '../../test-utils/mock-services';

import { getPartial } from '../../utils/helpers';


describe('SingleRowComplexKeyEditorService', () => {
  let service: SingleRowComplexKeyEditorService<MockEntity>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },

    ],
  }));

  beforeEach(() => {
    service = TestBed.get(MockSingleRowComplexKeyEditorService);
    spyOn(TestBed.get(Router), 'navigate');
  });

  describe('check methods of class', () => {

    it('get entityIdFields() correctly', () => {
      expect(service.entityIdFields).toEqual(JSON.parse(service['_entityIdField']));
    });

    it('selecteQuery()', () => {
      const handlerService = TestBed.get(MockHandlerService);
      handlerService._selected = '{}';
      const selectAllMultipleKeysSpy = spyOn(TestBed.get(QueryService), 'selectAllMultipleKeys');

      service['selectQuery']();

      expect(selectAllMultipleKeysSpy).toHaveBeenCalled();
    });

    it('updateDiffQuery()', () => {
      const getUpdateMultipleKeysQuerySpy = spyOn(TestBed.get(QueryService), 'getUpdateMultipleKeysQuery');

      service['updateDiffQuery']();

      expect(getUpdateMultipleKeysQuerySpy).toHaveBeenCalled();
      expect(getUpdateMultipleKeysQuerySpy).toHaveBeenCalledWith(
        service['_entityTable'],
        service['_originalValue'],
        service['_form'].getRawValue(),
        service['entityIdFields']
      );
    });

    it('updateFullQuery()', () => {
      const getFullDeleteInsertMultipleKeysQuerySpy = spyOn(TestBed.get(QueryService), 'getFullDeleteInsertMultipleKeysQuery');

      service['updateFullQuery']();

      expect(getFullDeleteInsertMultipleKeysQuerySpy).toHaveBeenCalled();
    });

    it('updateFullQuery() when isNew is true', () => {
      const getFullDeleteInsertMultipleKeysQuerySpy = spyOn(TestBed.get(QueryService), 'getFullDeleteInsertMultipleKeysQuery');
      const handlerService = TestBed.get(MockHandlerService);
      handlerService._selected = JSON.stringify({ 'id': 1, 'guid': 2 });
      service['_entityIdFields'] = ['id', 'guid'];

      service['onCreatingNewEntity']();
      service['updateFullQuery']();

      expect(getFullDeleteInsertMultipleKeysQuerySpy).toHaveBeenCalled();
    });

    it('reload()', () => {
      const resetSpy = spyOn<any>(service, 'reset');
      const reloadEntitySpy = spyOn<any>(service, 'reloadEntity');

      service.reload();

      expect(service['_loading']).toBe(true);
      expect(resetSpy).toHaveBeenCalled();
      expect(reloadEntitySpy).toHaveBeenCalled();
    });

    it('reloadAfterSave()', () => {
      const selectSpy = spyOn(TestBed.get(MockHandlerService), 'select');
      const reloadSpy = spyOn(service, 'reload');

      service['reloadAfterSave']();

      expect(service['_isNew']).toBe(false);
      expect(reloadSpy).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('reloadEntity()', () => {
      const selectQuerySpy = spyOn<any>(service, 'selectQuery');
      const error = { code: 'mock error', errno: 1234 } as MysqlError;
      selectQuerySpy.and.returnValue(of({ results: [{ [MOCK_NAME]: 'mockName' }] }));

      service['reloadEntity']();

      expect(selectQuerySpy).toHaveBeenCalled();
      expect(service['_loading']).toBe(false);

      selectQuerySpy.and.returnValue(throwError(error));

      service['reloadEntity']();

      expect(service['_error']).toBe(error);
    });

    it('onCreatingNewEntity()', () => {
      const handlerService = TestBed.get(MockHandlerService);
      const entityIdFieldsSpy = spyOnProperty(service, 'entityIdFields', 'get').and.returnValue(['id', 'guid', 'test']);
      handlerService._selected = JSON.stringify({ 'id': 1, 'guid': 2 });

      service['onCreatingNewEntity']();

      expect(service['_originalValue']['id']).toBe(1);
      expect(service['_isNew']).toBe(true);
    });

    it('setLoadedEntity()', () => {
      const selectSpy = spyOn(TestBed.get(MockHandlerService), 'select');

      service['_originalValue'] = new MockEntity();
      service['_originalValue'].id = 1;
      service['_originalValue'].guid = 0;
      service['_entityIdFields'] = ['id', 'guid'];

      service['setLoadedEntity']();

      expect(service['_loadedEntityId']).toEqual(
        JSON.stringify(getPartial(service['_originalValue'], service['_entityIdFields']))
      );
      expect(selectSpy).toHaveBeenCalled();
    });

    it('onReloadSuccessful()', () => {
      const onCreatingNewEntitySpy = spyOn<any>(service, 'onCreatingNewEntity');
      const updateFormAfterReloadSpy = spyOn<any>(service, 'updateFormAfterReload');
      const setLoadedEntitySpy = spyOn<any>(service, 'setLoadedEntity');
      const updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
      const onLoadedExistingEntitySpy = spyOn<any>(service, 'onLoadedExistingEntity');
      const data = { results: [] };

      service['onReloadSuccessful'](data);

      expect(updateFormAfterReloadSpy).toHaveBeenCalled();
      expect(setLoadedEntitySpy).toHaveBeenCalled();
      expect(updateFullQuerySpy).toHaveBeenCalled();
      expect(onLoadedExistingEntitySpy).toHaveBeenCalled();

      const handlerService = TestBed.get(MockHandlerService);
      handlerService.isNew = true;

      service['onReloadSuccessful'](data);

      expect(onCreatingNewEntitySpy).toHaveBeenCalled();
    });

  });

});
