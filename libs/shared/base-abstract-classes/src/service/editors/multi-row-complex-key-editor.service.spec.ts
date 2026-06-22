import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { TableRow } from '@keira/shared/constants';
import { QueryError } from 'mysql2';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MultiRowComplexKeyEditorService } from './multi-row-complex-key-editor.service';

import { mockChangeDetectorRef } from '@keira/shared/test-utils';
import { MockEntity, MockHandlerService, MockMultiRowComplexKeyEditorService } from '../../core.mock';

describe('MultiRowComplexKeyEditorService', () => {
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
    const service: MultiRowComplexKeyEditorService<MockEntity> = TestBed.inject(MockMultiRowComplexKeyEditorService);
    return { service };
  }

  it('get entityIdFields() should correcty work', () => {
    const { service } = setup();
    expect(service.entityIdFields).toEqual(JSON.parse(service['_entityIdField'] as string));
  });

  it('updateDiffQuery should correctly work', () => {
    const { service } = setup();
    const queryService = TestBed.inject(MysqlQueryService);
    const getDiffDeleteInsertTwoKeysQuerySpy = vi.spyOn(queryService, 'getDiffDeleteInsertTwoKeysQuery').mockReturnValue('-- Mock Query');
    vi.spyOn<any>(service, 'updateEditorStatus').mockImplementation(() => undefined);

    service['updateDiffQuery']();

    expect(getDiffDeleteInsertTwoKeysQuerySpy).toHaveBeenCalledTimes(1);
    expect(service['updateEditorStatus']).toHaveBeenCalledTimes(1);
  });

  it('addToNewRow should correctly work', () => {
    const { service } = setup();
    const newRow = new MockEntity();
    const mockKeyObj: Partial<MockEntity> = { id: 123, guid: 1000 };
    service['_loadedEntityId'] = mockKeyObj;

    service['addIdToNewRow'](newRow);

    expect(newRow.id).toEqual(mockKeyObj.id as number);
    expect(newRow.guid).toEqual(mockKeyObj.guid as number);
  });

  it('reload should correctly work', () => {
    const { service } = setup();
    const resetSpy = vi.spyOn<any>(service, 'reset').mockImplementation(() => undefined);
    const reloadEntitySpy = vi.spyOn<any>(service, 'reloadEntity').mockImplementation(() => undefined);

    service.reload(mockChangeDetectorRef);

    expect(service['_loading']).toBe(true);
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(reloadEntitySpy).toHaveBeenCalledTimes(1);
  });

  it('selectQuery should correctly work', () => {
    const { service } = setup();
    const queryService = TestBed.inject(MysqlQueryService);
    const selectAllMultipleKeysSpy = vi.spyOn(queryService, 'selectAllMultipleKeys').mockReturnValue(of([{ mock: 'data' }] as TableRow[]));
    const handlerService = TestBed.inject(MockHandlerService);
    handlerService['_selected'] = '1';

    service['selectQuery']();

    expect(selectAllMultipleKeysSpy).toHaveBeenCalledTimes(1);
  });

  it('reloadEntity should correctly work', () => {
    const { service } = setup();
    vi.spyOn<any>(service, 'onReloadSuccessful').mockImplementation(() => undefined);
    const error = { code: 'mock error', errno: 1234 } as QueryError;
    const selectQuerySpy = vi.spyOn<any>(service, 'selectQuery').mockReturnValue(of({ mock: 'data' }));

    service['reloadEntity'](mockChangeDetectorRef);

    expect(selectQuerySpy).toHaveBeenCalled();
    expect(service.error).toBe(undefined as any);
    expect(service.loading).toBe(false);

    selectQuerySpy.mockReturnValue(throwError(error));

    service['reloadEntity'](mockChangeDetectorRef);

    expect(service.error).toBeDefined();
  });

  it('onReloadSuccessful should correctly work', () => {
    const { service } = setup();
    const res = [
      {
        id: 0,
        guid: 0,
        name: '',
      },
    ];
    const mockData: MockEntity[] = res;
    const handlerService = TestBed.inject(MockHandlerService);
    const updateFullQuerySpy = vi.spyOn<any>(service, 'updateFullQuery').mockImplementation(() => undefined);
    const disableFormSpy = vi.spyOn(service['_form'], 'disable').mockImplementation(() => undefined);

    handlerService['_selected'] = JSON.stringify({ id: 1, guid: 2 });

    service['onReloadSuccessful'](mockData);

    expect(service.newRows).toEqual(res);
    expect(service['_newRows']).toEqual([...res]);
    expect(service['_selectedRowId']).toBe(undefined);
    expect(disableFormSpy).toHaveBeenCalledTimes(1);
    expect(service['_loadedEntityId']).toEqual(JSON.parse(handlerService.selected));
    expect(service['_nextRowId']).toBe(0);
    expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
  });
});
