import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import Spy = jasmine.Spy;

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { MultiRowEditorService } from './multi-row-editor.service';
import { MOCK_ID, MOCK_ID_2, MOCK_NAME, MockEntity, MockMultiRowEditorService } from '../../test-utils/mock-services';
import { MysqlResult } from '../../types/general';


describe('MultiRowEditorService', () => {
  let service: MultiRowEditorService<MockEntity>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(MockMultiRowEditorService);
  });

  describe('when the form value changes', () => {
    let updateDiffQuerySpy: Spy;
    let updateFullQuerySpy: Spy;

    beforeEach(() => {
      updateDiffQuerySpy = spyOn<any>(service, 'updateDiffQuery');
      updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
    });

    it('when loading is true, should do nothing', () => {
      service['_loading'] = true;

      service.form.get('id').setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when isFormIdUnique() is false, should do nothing', () => {
      spyOn(service, 'isFormIdUnique').and.returnValue(false);

      service.form.get('id').setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when loading is false and the form dirty, should update both the queries', () => {
      service.form.markAsDirty();

      service.form.get('id').setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('modifying the form twice with the same value should not have effect', () => {
      service.form.markAsDirty();

      service.form.get('id').setValue(123);
      service.form.get('id').setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });
  });

  it('updateDiffQuery() should correctly work', () => {
    service['_diffQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.get(QueryService), 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(queryResult);

    service['updateDiffQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      service['_entityIdField'],
      service.entitySecondIdField,
      service['_originalRows'],
      service.newRows,
    );
    expect(service.diffQuery).toEqual(queryResult);
  });

  it('updateFullQuery() should correctly work', () => {
    service['_fullQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.get(QueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      service.newRows,
      service['_entityIdField'],
    );
    expect(service.fullQuery).toEqual(queryResult);
  });

  describe('getRowIndex(id)', () => {
    beforeEach(() => {
      service['_newRows'] = [
        { [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: 'test' },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 5, [MOCK_NAME]: 'test' },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 9, [MOCK_NAME]: 'test' },
      ];
    });

    it('should correctly return the index', () => {
      expect(service['getRowIndex'](3)).toEqual(0);
      expect(service['getRowIndex'](5)).toEqual(1);
      expect(service['getRowIndex'](9)).toEqual(2);
    });

    it('should give error if the index is not found', () => {
      const errorSpy = spyOn(console, 'error');

      service['getRowIndex'](133);

      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('getSelectedRowIndex() should correctly work', () => {
    const selectedRowId = 100;
    const rowIndex = 3;
    const getRowIndexSpy = spyOn<any>(service, 'getRowIndex').and.returnValue(rowIndex);
    service['_selectedRowId'] = selectedRowId;

    expect(service['getSelectedRowIndex']()).toEqual(rowIndex);
    expect(getRowIndexSpy).toHaveBeenCalledWith(selectedRowId);
  });

  it('onReloadSuccessful() should correctly work', () => {
    service['_selectedRowId'] = 111;
    service['_loadedEntityId'] = 123456;
    service.form.enable();
    service['_originalRows'] = [{ [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: 'some previous value' }];
    service['_newRows'] = [{ [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: '.....some previous value' }];
    const rows = [{ [MOCK_ID]: 123, [MOCK_ID_2]: 1, [MOCK_NAME]: 'new value' }];
    const data: MysqlResult<MockEntity> = { results: rows };
    const id = 10;
    const updateFullQuerySpy: Spy = spyOn<any>(service, 'updateFullQuery');

    service['onReloadSuccessful'](data, id);

    expect(service['_originalRows']).toEqual(rows);
    expect(service['_newRows']).toEqual(rows);
    expect(service.selectedRowId).toBeNull();
    expect(service.form.disabled).toBe(true);
    expect(service['_loadedEntityId']).toBe(id);
    expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
  });

  describe('onRowSelection()', () => {
    const rowId = 12345;
    let selected;
    let formResetSpy: Spy;
    let formEnableSpy: Spy;

    beforeEach(() => {
      selected = [{ [service['_entitySecondIdField']]: rowId }];
      formResetSpy = spyOn(service.form, 'reset');
      formEnableSpy = spyOn(service.form, 'enable');
    });

    it('should do nothing if the same row is already selected', () => {
      service['_selectedRowId'] = rowId;

      service.onRowSelection({ selected });

      expect(formResetSpy).toHaveBeenCalledTimes(0);
      expect(formEnableSpy).toHaveBeenCalledTimes(0);
    });
  });



  it('TODO', () => {

  });
});
