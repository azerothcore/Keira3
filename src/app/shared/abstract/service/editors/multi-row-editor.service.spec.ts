import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MOCK_ID, MOCK_ID_2, MOCK_NAME, MockEntity, MockMultiRowEditorService } from '@keira-testing/mock-services';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { MultiRowEditorService } from './multi-row-editor.service';
import Spy = jasmine.Spy;

describe('MultiRowEditorService', () => {
  let service: MultiRowEditorService<MockEntity>;

  let updateDiffQuerySpy: Spy;
  let updateFullQuerySpy: Spy;
  let formResetSpy: Spy;
  let formEnableSpy: Spy;
  let formDisableSpy: Spy;

  const queryResult = '-- Mock query result';
  const rowId = 12345;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
      ],
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(MockMultiRowEditorService);
  });

  describe('when the form value changes', () => {
    beforeEach(() => {
      updateDiffQuerySpy = spyOn<any>(service, 'updateDiffQuery');
      updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
    });

    it('when loading is true, should do nothing', () => {
      service['_loading'] = true;

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when isFormIdUnique() is false, should do nothing', () => {
      spyOn(service, 'isFormIdUnique').and.returnValue(false);

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when loading is false and the form dirty, should update both the queries', () => {
      service.form.markAsDirty();

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('modifying the form twice with the same value should not have effect', () => {
      service.form.markAsDirty();

      service.form.controls.id.setValue(123);
      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });
  });

  it('updateDiffQuery() should correctly work', () => {
    service['_diffQuery'] = '';
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(queryResult);
    spyOn<any>(service, 'updateEditorStatus');

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
    expect(service['updateEditorStatus']).toHaveBeenCalledTimes(1);
  });

  it('updateFullQuery() should correctly work', () => {
    service['_fullQuery'] = '';
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(service.entityTable, service.newRows, service['_entityIdField']);
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
    const id = 10;
    updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');

    service['onReloadSuccessful'](rows, id);

    expect(service['_originalRows']).toEqual(rows);
    expect(service['_newRows']).toEqual(rows);
    expect(service.selectedRowId).toBeNull();
    expect(service.form.disabled).toBe(true);
    expect(service['_loadedEntityId']).toBe(id);
    expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
  });

  describe('onRowSelection()', () => {
    let selected;

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

    it('should correctly work', () => {
      const rows = [{ [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: 'some name' }];
      service['_newRows'] = rows;
      spyOn<any>(service, 'getSelectedRowIndex').and.returnValue(0);

      service.onRowSelection({ selected });

      expect(service.form.controls[MOCK_ID].value).toEqual(rows[0][MOCK_ID]);
      expect(service.form.controls[MOCK_ID_2].value).toEqual(rows[0][MOCK_ID_2]);
      expect(service.form.controls[MOCK_NAME].value).toEqual(rows[0][MOCK_NAME]);
      expect(formResetSpy).toHaveBeenCalledTimes(1);
      expect(formEnableSpy).toHaveBeenCalledTimes(1);
      expect(service.loading).toBe(false);
    });
  });

  it('isRowSelected() should correctly work', () => {
    service['_selectedRowId'] = rowId;

    expect(service.isRowSelected({ [MOCK_ID]: 1, [MOCK_ID_2]: rowId, [MOCK_NAME]: '' })).toBe(true);
    expect(service.isRowSelected({ [MOCK_ID]: 1, [MOCK_ID_2]: 11111, [MOCK_NAME]: '' })).toBe(false);
  });

  describe('deleteSelectedRow()', () => {
    beforeEach(() => {
      updateDiffQuerySpy = spyOn<any>(service, 'updateDiffQuery');
      updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
      formResetSpy = spyOn(service.form, 'reset');
      formDisableSpy = spyOn(service.form, 'disable');
    });

    it('should not do anything if there is no selected row', () => {
      service['_selectedRowId'] = null;

      service.deleteSelectedRow();

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
      expect(formResetSpy).toHaveBeenCalledTimes(0);
      expect(formDisableSpy).toHaveBeenCalledTimes(0);
    });

    it('should correctly remove the selected row', () => {
      service['_newRows'] = [{ [MOCK_ID]: 1, [MOCK_ID_2]: 11111, [MOCK_NAME]: '' }];
      spyOn<any>(service, 'getSelectedRowIndex').and.returnValue(0);

      service.deleteSelectedRow();

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
      expect(formResetSpy).toHaveBeenCalledTimes(1);
      expect(formDisableSpy).toHaveBeenCalledTimes(1);
      expect(service.newRows).toEqual([]);
    });
  });

  describe('addNewRow()', () => {
    let onRowSelectionSpy: Spy;
    let newRow: MockEntity;

    const loadedEntityId = 123;
    const nextRowId = 3;

    beforeEach(() => {
      updateDiffQuerySpy = spyOn<any>(service, 'updateDiffQuery');
      updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
      onRowSelectionSpy = spyOn(service, 'onRowSelection');

      service['_loadedEntityId'] = loadedEntityId;
      service['_nextRowId'] = nextRowId;
      service['_newRows'] = [];
      newRow = new MockEntity();
      newRow[MOCK_ID_2] = nextRowId;
    });

    it('it should correctly work [with main entityIdField]', () => {
      newRow[MOCK_ID] = loadedEntityId;

      service.addNewRow();

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledWith({ selected: [newRow] });
      expect(service.newRows).toEqual([{ ...newRow }]);
      expect(service['_nextRowId']).toEqual(nextRowId);
    });

    it('it should correctly work [without main entityIdField]', () => {
      service['_entityIdField'] = null;

      service.addNewRow();

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledWith({ selected: [newRow] });
      expect(service.newRows).toEqual([{ ...newRow }]);
      expect(service['_nextRowId']).toEqual(nextRowId);
    });

    it('it should correctly assign the new row id', () => {
      newRow[MOCK_ID] = loadedEntityId;
      service['_newRows'] = [{ ...newRow }, { ...newRow }];
      service['_newRows'][0][MOCK_ID_2] = 3;
      service['_newRows'][1][MOCK_ID_2] = 4;

      service.addNewRow();

      expect(service['_nextRowId']).toEqual(5);
    });
  });

  describe('isFormIdUnique()', () => {
    beforeEach(() => {
      service['_newRows'] = [
        { [MOCK_ID]: 123, [MOCK_ID_2]: 1, [MOCK_NAME]: '' },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 2, [MOCK_NAME]: '' },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: '' },
      ];
    });

    it('should return true when the form has a unique id', () => {
      service.form.controls[MOCK_ID_2].setValue(4);
      expect(service.isFormIdUnique()).toBe(true);
    });

    it('should return false when the form has an already used id that is NOT the selected row', () => {
      service.form.controls[MOCK_ID_2].setValue(2);
      expect(service.isFormIdUnique()).toBe(false);
    });

    it('should return true when the form has an already used id that is the selected row', () => {
      service.form.controls[MOCK_ID_2].setValue(2);
      service['_selectedRowId'] = 2;
      expect(service.isFormIdUnique()).toBe(true);
    });
  });

  it('refreshDatatable', () => {
    const oldRows = service['_newRows'];
    service.refreshDatatable();
    expect(oldRows).not.toBe(service['_newRows']);
  });
});
