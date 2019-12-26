import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { MysqlError } from 'mysql';

import Spy = jasmine.Spy;

import { MultiRowComplexKeyEditorService } from './multi-row-complex-key-editor.service';
import { QueryService } from '../query.service';
import { MockedQueryService, MockedToastrService } from '../../test-utils/mocks';
import { MockEntity, MockMultiRowComplexKeyEditorService, MockHandlerService } from '../../test-utils/mock-services';
import { MysqlResult } from '../../types/general';

describe('MultiRowComplexKeyEditorService', () => {
  let service: MultiRowComplexKeyEditorService<MockEntity>;

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
    service = TestBed.get(MockMultiRowComplexKeyEditorService);
  });

  it('get entityIdFields() should correcty work', () => {
    expect(service.entityIdFields).toEqual(JSON.parse(service['_entityIdField']));
  });

  it('updateDiffQuery should correctly work', () => {
    const queryService = TestBed.get(QueryService);
    const getDiffDeleteInsertTwoKeysQuerySpy = spyOn(queryService, 'getDiffDeleteInsertTwoKeysQuery').and.returnValue('-- Mock Query');

    service['updateDiffQuery']();

    expect(getDiffDeleteInsertTwoKeysQuerySpy).toHaveBeenCalledTimes(1);
  });

  it('addToNewRow should correctly work', () => {
    const newRow = new MockEntity();
    const mockKeyObj: Partial<MockEntity> = { id: 123, guid: 1000 };
    service['_loadedEntityId'] = mockKeyObj;

    service['addIdToNewRow'](newRow);

    expect(newRow.id).toEqual(mockKeyObj.id);
    expect(newRow.guid).toEqual(mockKeyObj.guid);
  });

  it('reload should correctly work', () => {

    const resetSpy: Spy = spyOn<any>(service, 'reset');
    const reloadEntitySpy: Spy = spyOn<any>(service, 'reloadEntity');

    service.reload();

    expect(service['_loading']).toBe(true);
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(reloadEntitySpy).toHaveBeenCalledTimes(1);
  });

  it('selectQuery should correctly work', () => {
    const queryService = TestBed.get(QueryService);
    const selectAllMultipleKeysSpy = spyOn(queryService, 'selectAllMultipleKeys').and.returnValue(of({ mock: 'data' }));
    const handlerService = TestBed.get(MockHandlerService);
    handlerService['_selected'] = 1;

    service['selectQuery']();

    expect(selectAllMultipleKeysSpy).toHaveBeenCalledTimes(1);
  });

  it('reloadEntity should correctly work', () => {

    const onReloadSuccessfulSpy: Spy = spyOn<any>(service, 'onReloadSuccessful');
    const error = { code: 'mock error', errno: 1234 } as MysqlError;
    const selectQuerySpy: Spy = spyOn<any>(service, 'selectQuery').and.returnValue(of({ mock: 'data' }));

    service['reloadEntity']();

    expect(selectQuerySpy).toHaveBeenCalled();
    expect(service.error).toBe(null);
    expect(service.loading).toBe(false);

    selectQuerySpy.and.returnValue(throwError(error));

    service['reloadEntity']();

    expect(service.error).toBeDefined();
  });

  it('onReloadSuccessful should correctly work', () => {
    const res = [{
      id: 0,
      guid: 0,
      name: '',
    }];
    const mockData: MysqlResult<MockEntity> = { results: res };
    const handlerService = TestBed.get(MockHandlerService);
    const updateFullQuerySpy: Spy = spyOn<any>(service, 'updateFullQuery');
    const disableFormSpy: Spy = spyOn(service['_form'], 'disable');

    handlerService['_selected'] = 1;

    service['onReloadSuccessful'](mockData);

    expect(service.newRows).toEqual(res);
    expect(service['_newRows']).toEqual([...res ]);
    expect(service['_selectedRowId']).toBe(null);
    expect(disableFormSpy).toHaveBeenCalledTimes(1);
    expect(service['_loadedEntityId']).toEqual(handlerService.selected);
    expect(service['_nextRowId']).toBe(0);
    expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
  });

});
