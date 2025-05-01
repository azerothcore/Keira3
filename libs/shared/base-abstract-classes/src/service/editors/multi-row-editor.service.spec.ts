import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';

import {
  MOCK_EXTRA_ID,
  MOCK_ID,
  MOCK_ID_2,
  MOCK_NAME,
  MockEntity,
  MockEntityExtra,
  MockMultiRowEditorExtraService,
  MockMultiRowEditorService,
  MockMultiRowEditorWithGuidStringService,
} from '../../core.mock';

describe('MultiRowEditorService', () => {
  const queryResult = '-- Mock query result';
  const rowId = 12345;
  const extraRowId = 999;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
      ],
    }),
  );

  function setup(
    config: { loadedEntityId?: number; nextRowId?: number; newRows?: (MockEntity | MockEntityExtra)[]; extra?: boolean, withGuidString?: boolean } = {},
  ) {
    const service = config.extra
      ? TestBed.inject(MockMultiRowEditorExtraService)
      : config.withGuidString
        ? TestBed.inject(MockMultiRowEditorWithGuidStringService)
        : TestBed.inject(MockMultiRowEditorService);

    const updateDiffQuerySpy = spyOn<any>(service, 'updateDiffQuery');
    const updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
    const formResetSpy = spyOn(service.form, 'reset').and.callThrough();
    const formEnableSpy = spyOn(service.form, 'enable').and.callThrough();
    const formDisableSpy = spyOn(service.form, 'disable').and.callThrough();

    const selected = [
      { [service['_entitySecondIdField']]: rowId, [service['_entityExtraIdField'] as any]: extraRowId } as unknown as MockEntity,
    ];

    if (config.loadedEntityId) {
      service['_loadedEntityId'] = config.loadedEntityId;
    }
    if (config.nextRowId) {
      service['_nextRowId'] = config.nextRowId;
    }
    if (config.newRows) {
      service['_newRows'] = config.newRows;
    }

    return { service, updateDiffQuerySpy, updateFullQuerySpy, formResetSpy, formEnableSpy, formDisableSpy, selected };
  }

  describe('when the form value changes', () => {
    it('when loading is true, should do nothing', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setup();
      service['_loading'] = true;

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when isFormIdUnique() is false, should do nothing', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setup();
      spyOn(service, 'isFormIdUnique').and.returnValue(false);

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when loading is false and the form dirty, should update both the queries', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setup();
      service.form.markAsDirty();

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('modifying the form twice with the same value should not have effect', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setup();
      service.form.markAsDirty();

      service.form.controls.id.setValue(123);
      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });
  });

  it('updateDiffQuery() should correctly work', () => {
    const { service, updateDiffQuerySpy } = setup();
    updateDiffQuerySpy.and.callThrough();
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
    const { service, updateFullQuerySpy } = setup();
    updateFullQuerySpy.and.callThrough();
    service['_fullQuery'] = '';
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(service.entityTable, service.newRows, service['_entityIdField']);
    expect(service.fullQuery).toEqual(queryResult);
  });

  describe('getRowIndex(id)', () => {
    const newRows = [
      { [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: 'test' },
      { [MOCK_ID]: 123, [MOCK_ID_2]: 5, [MOCK_NAME]: 'test' },
      { [MOCK_ID]: 123, [MOCK_ID_2]: 9, [MOCK_NAME]: 'test' },
    ];

    it('should correctly return the index', () => {
      const { service } = setup({ newRows });

      expect(service['getRowIndex'](3)).toEqual(0);
      expect(service['getRowIndex'](5)).toEqual(1);
      expect(service['getRowIndex'](9)).toEqual(2);
    });

    it('should give error if the index is not found', () => {
      const { service } = setup({ newRows });
      const errorSpy = spyOn(console, 'error');

      service['getRowIndex'](133);

      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('getSelectedRowIndex() should correctly work', () => {
    const { service } = setup();
    const selectedRowId = 100;
    const rowIndex = 3;
    const getRowIndexSpy = spyOn<any>(service, 'getRowIndex').and.returnValue(rowIndex);
    service['_selectedRowId'] = selectedRowId;

    expect(service['getSelectedRowIndex']()).toEqual(rowIndex);
    expect(getRowIndexSpy).toHaveBeenCalledWith(selectedRowId);
  });

  it('onReloadSuccessful() should correctly work', () => {
    const { service, updateFullQuerySpy } = setup();
    service['_selectedRowId'] = 111;
    service['_loadedEntityId'] = 123456;
    service.form.enable();
    service['_originalRows'] = [{ [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: 'some previous value' }];
    service['_newRows'] = [{ [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: '.....some previous value' }];
    const rows = [{ [MOCK_ID]: 123, [MOCK_ID_2]: 1, [MOCK_NAME]: 'new value' }];
    const id = 10;

    service['onReloadSuccessful'](rows, id);

    expect(service['_originalRows']).toEqual(rows);
    expect(service['_newRows']).toEqual(rows);
    expect(service.selectedRowId).toBeUndefined();
    expect(service.form.disabled).toBe(true);
    expect(service['_loadedEntityId']).toBe(id);
    expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
  });

  describe('onRowSelection()', () => {
    it('should do nothing if the same row is already selected', () => {
      const { service, formEnableSpy, formResetSpy, selected } = setup();
      service['_selectedRowId'] = rowId;

      service.onRowSelection({ selected });

      expect(formResetSpy).toHaveBeenCalledTimes(0);
      expect(formEnableSpy).toHaveBeenCalledTimes(0);
    });

    it('should correctly work', () => {
      const { service, formEnableSpy, formResetSpy, selected } = setup();
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
    const { service } = setup();
    service['_selectedRowId'] = rowId;

    expect(service.isRowSelected({ [MOCK_ID]: 1, [MOCK_ID_2]: rowId, [MOCK_NAME]: '' })).toBe(true);
    expect(service.isRowSelected({ [MOCK_ID]: 1, [MOCK_ID_2]: 11111, [MOCK_NAME]: '' })).toBe(false);
  });

  describe('deleteSelectedRow()', () => {
    it('should not do anything if there is no selected row', () => {
      const { service, formDisableSpy, formResetSpy, updateDiffQuerySpy, updateFullQuerySpy } = setup();
      service['_selectedRowId'] = undefined;

      service.deleteSelectedRow();

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
      expect(formResetSpy).toHaveBeenCalledTimes(0);
      expect(formDisableSpy).toHaveBeenCalledTimes(0);
    });

    it('should correctly remove the selected row', () => {
      const { service, formDisableSpy, formResetSpy, updateDiffQuerySpy, updateFullQuerySpy } = setup();
      service['_newRows'] = [{ [MOCK_ID]: 1, [MOCK_ID_2]: 11111, [MOCK_NAME]: '' }];
      service['_selectedRowId'] = 0;
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
    const loadedEntityId = 123;
    const nextRowId = 3;

    it('it should correctly copy the selected row when copySelectedRow = true', () => {
      const currentlySelectedRow = { [MOCK_ID]: 123, [MOCK_ID_2]: 4, [MOCK_NAME]: '' };
      const newRows = [
        { [MOCK_ID]: 123, [MOCK_ID_2]: 1, [MOCK_NAME]: '' },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 2, [MOCK_NAME]: '' },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: '' },
        currentlySelectedRow,
      ];
      const expectedNewRow = { ...currentlySelectedRow, [MOCK_ID_2]: 5 };
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setup({ newRows, loadedEntityId, nextRowId });
      service.onRowSelection({ selected: [currentlySelectedRow] });
      const onRowSelectionSpy = spyOn(service, 'onRowSelection');

      service.addNewRow(true);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledWith({ selected: [expectedNewRow] });
      expect(service.newRows).toEqual([...newRows, expectedNewRow]);
      expect(service['_nextRowId']).toEqual(5);
    });

    it('it should correctly work [with main entityIdField]', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setup({ loadedEntityId, nextRowId, newRows: [] });
      const onRowSelectionSpy = spyOn(service, 'onRowSelection');
      const newRow = new MockEntity();
      newRow[MOCK_ID_2] = nextRowId;
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
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setup({ loadedEntityId, nextRowId, newRows: [] });
      const onRowSelectionSpy = spyOn(service, 'onRowSelection');
      const newRow = new MockEntity();
      newRow[MOCK_ID_2] = nextRowId;
      (service['_entityIdField'] as any) = undefined;

      service.addNewRow();

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledTimes(1);
      expect(onRowSelectionSpy).toHaveBeenCalledWith({ selected: [newRow] });
      expect(service.newRows).toEqual([{ ...newRow }]);
      expect(service['_nextRowId']).toEqual(nextRowId);
    });

    it('it should correctly assign the new row id', () => {
      const { service } = setup({ loadedEntityId, nextRowId, newRows: [] });
      spyOn(service, 'onRowSelection');
      const newRow = new MockEntity();
      newRow[MOCK_ID_2] = nextRowId;
      newRow[MOCK_ID] = loadedEntityId;
      service['_newRows'] = [{ ...newRow }, { ...newRow }];
      service['_newRows'][0][MOCK_ID_2] = 3;
      service['_newRows'][1][MOCK_ID_2] = 4;

      service.addNewRow();

      expect(service['_nextRowId']).toEqual(5);
    });

    it('it should assign nextId as a string to string-typed field', () => {
      const nextRowId = 3;
      const { service } = setup({ nextRowId, newRows: [], withGuidString: true });

      service.addNewRow();

      expect(typeof service.newRows[0][MOCK_ID_2]).toBe('string');
    });
  });

  describe('isFormIdUnique()', () => {
    const newRows = [
      { [MOCK_ID]: 123, [MOCK_ID_2]: 1, [MOCK_NAME]: '' },
      { [MOCK_ID]: 123, [MOCK_ID_2]: 2, [MOCK_NAME]: '' },
      { [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: '' },
    ];

    it('should return true when the form has a unique id', () => {
      const { service } = setup({ newRows });

      service.form.controls[MOCK_ID_2].setValue(4);
      expect(service.isFormIdUnique()).toBe(true);
    });

    it('should return false when the form has an already used id that is NOT the selected row', () => {
      const { service } = setup({ newRows });

      service.form.controls[MOCK_ID_2].setValue(2);
      expect(service.isFormIdUnique()).toBe(false);
    });

    it('should return true when the form has an already used id that is the selected row', () => {
      const { service } = setup({ newRows });

      service.form.controls[MOCK_ID_2].setValue(2);
      service['_selectedRowId'] = 2;
      expect(service.isFormIdUnique()).toBe(true);
    });
  });

  it('refreshDatatable', () => {
    const { service } = setup();
    const oldRows = service['_newRows'];
    service.refreshDatatable();
    expect(oldRows).not.toBe(service['_newRows']);
  });

  describe('extra row id', () => {
    it('isRowSelected() should correctly work', () => {
      const { service } = setup({ extra: true });
      service['_selectedRowId'] = `${rowId}_${extraRowId}`;

      expect(service.isRowSelected({ [MOCK_ID]: 1, [MOCK_ID_2]: rowId, [MOCK_NAME]: '', [MOCK_EXTRA_ID]: extraRowId })).toBe(true);
      expect(service.isRowSelected({ [MOCK_ID]: 1, [MOCK_ID_2]: rowId, [MOCK_NAME]: '', [MOCK_EXTRA_ID]: 11111 })).toBe(false);
    });

    it('onRowSelection() should do nothing if the same row is already selected', () => {
      const { service, formEnableSpy, formResetSpy, selected } = setup({ extra: true });
      service['_selectedRowId'] = `${rowId}_${extraRowId}`;

      service.onRowSelection({ selected });

      expect(formResetSpy).toHaveBeenCalledTimes(0);
      expect(formEnableSpy).toHaveBeenCalledTimes(0);
    });

    it('isFormIdUnique should return true when the form has a unique id', () => {
      const newRows = [
        { [MOCK_ID]: 123, [MOCK_ID_2]: 1, [MOCK_NAME]: '', [MOCK_EXTRA_ID]: 1 },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 2, [MOCK_NAME]: '', [MOCK_EXTRA_ID]: 2 },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: '', [MOCK_EXTRA_ID]: 3 },
      ];
      const { service } = setup({ newRows, extra: true });

      service.form.controls[MOCK_ID_2].setValue(4);
      service.form?.controls[MOCK_EXTRA_ID]?.setValue(4);

      expect(service.isFormIdUnique()).toBe(true);
    });

    it('getRowIndex(id) should correctly return the index', () => {
      const newRows = [
        { [MOCK_ID]: 123, [MOCK_ID_2]: 3, [MOCK_NAME]: 'test', [MOCK_EXTRA_ID]: 1 },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 5, [MOCK_NAME]: 'test', [MOCK_EXTRA_ID]: 2 },
        { [MOCK_ID]: 123, [MOCK_ID_2]: 9, [MOCK_NAME]: 'test', [MOCK_EXTRA_ID]: 3 },
      ];
      const { service } = setup({ newRows, extra: true });

      expect(service['getRowIndex']('3_1')).toEqual(0);
      expect(service['getRowIndex']('5_2')).toEqual(1);
      expect(service['getRowIndex']('9_3')).toEqual(2);

      expect(service['getRowIndex']('3_9')).toEqual(0);
    });
  });
});
