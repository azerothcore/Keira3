import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SingleRowEditorService } from './single-row-editor.service';

import { MockEntity, MockHandlerService, MockSingleRowEditorService } from '../../core.mock';

describe('SingleRowEditorService', () => {
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
    const service: SingleRowEditorService<MockEntity> = TestBed.inject(MockSingleRowEditorService);
    return { service };
  }

  describe('when the form value changes', () => {
    function setupFormChange() {
      const { service } = setup();
      const updateDiffQuerySpy = vi.spyOn<any>(service, 'updateDiffQuery').mockImplementation(() => undefined);
      const updateFullQuerySpy = vi.spyOn<any>(service, 'updateFullQuery').mockImplementation(() => undefined);
      return { service, updateDiffQuerySpy, updateFullQuerySpy };
    }

    it('when loading is true, should do nothing', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setupFormChange();
      service['_loading'] = true;

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when loading is false and the form is not dirty, should update only the full query', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setupFormChange();
      service.form.markAsPristine();

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('when loading is false and the form dirty, should update both the queries', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setupFormChange();
      service.form.markAsDirty();

      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('modifying the form twice with the same value should not have effect', () => {
      const { service, updateDiffQuerySpy, updateFullQuerySpy } = setupFormChange();
      service.form.markAsDirty();

      service.form.controls.id.setValue(123);
      service.form.controls.id.setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });
  });

  it('updateDiffQuery should correctly work', () => {
    const { service } = setup();
    service['_diffQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'getUpdateQuery').mockReturnValue(queryResult);
    vi.spyOn<any>(service, 'updateEditorStatus').mockImplementation(() => undefined);

    service['updateDiffQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      service['_entityIdField'],
      service['_originalValue'],
      service.form.getRawValue(),
    );
    expect(service.diffQuery).toEqual(queryResult);
    expect(service['updateEditorStatus']).toHaveBeenCalledTimes(1);
  });

  it('updateFullQuery() should correctly work', () => {
    const { service } = setup();
    service['_fullQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertQuery').mockReturnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(service.entityTable, [service.form.getRawValue()], service['_entityIdField']);
    expect(service.fullQuery).toEqual(queryResult);
  });

  describe('onReloadSuccessful()', () => {
    const id = 123456;

    function setupReload() {
      const { service } = setup();
      const updateFullQuerySpy = vi.spyOn<any>(service, 'updateFullQuery').mockImplementation(() => undefined);
      return { service, updateFullQuerySpy };
    }

    it('should correctly work when loading an existing entity [as main entity]', () => {
      const { service, updateFullQuerySpy } = setupReload();
      const handlerService = TestBed.inject(MockHandlerService);
      const entity: MockEntity = { id, guid: 12345, name: 'myName' };
      const data = [entity];
      handlerService.isNew = true;

      service['onReloadSuccessful'](data, id);

      expect(service['_originalValue']).toEqual(data[0]);
      expect(service.isNew).toBe(false);

      expect(handlerService.isNew).toBe(false);
      expect(handlerService.selectedName).toBe(`${service['_originalValue'][service['_entityNameField'] as string]}`);

      expect(service.form.getRawValue()).toEqual(entity);
      expect(service.loadedEntityId).toEqual(`${entity.id}`);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('should correctly work when loading an existing entity [as non-main entity]', () => {
      const { service, updateFullQuerySpy } = setupReload();
      const handlerService = TestBed.inject(MockHandlerService);
      const entity: MockEntity = { id, guid: 12345, name: 'myName' };
      const data = [entity];
      handlerService.isNew = true;
      service['isMainEntity'] = false;

      service['onReloadSuccessful'](data, id);

      expect(service['_originalValue']).toEqual(data[0]);
      expect(service.isNew).toBe(false);

      expect(handlerService.isNew).toBe(true);
      expect(handlerService.selectedName).toBe(undefined as any);

      expect(service.form.getRawValue()).toEqual(entity);
      expect(service.loadedEntityId).toEqual(`${entity.id}`);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('should correctly work when creating a new entity', () => {
      const { service, updateFullQuerySpy } = setupReload();
      const data: MockEntity[] = [];

      service['onReloadSuccessful'](data, id);

      expect(service.form.getRawValue()).toEqual({ id, guid: 0, name: '' });
      expect(service.loadedEntityId).toEqual(`${id}`);
      expect(service.isNew).toBe(true);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateFormAfterReload()', () => {
    let consoleWarnSpy: Spy;
    let mockForm: any;

    beforeEach(() => {
      // Mock the form and its controls
      mockForm = {
        controls: {
          id: { setValue: jasmine.createSpy('setValue') },
          name: { setValue: jasmine.createSpy('setValue') },
          guid: { setValue: jasmine.createSpy('setValue') }, // Add guid control
        },
      };
      service['_form'] = mockForm;

      // Mock originalValue
      service['_originalValue'] = { id: 123, name: 'Test Name', guid: 456 }; // Add guid value

      // Spy on console.warn
      consoleWarnSpy = spyOn(console, 'warn');

      // Temporarily override `fields` for testing
      Object.defineProperty(service, 'fields', {
        value: ['id', 'name', 'guid', 123 as any, null as any],
        writable: true,
      });
    });

    it('should set values for valid fields in the form', () => {
      service['updateFormAfterReload']();

      expect(mockForm.controls.id.setValue).toHaveBeenCalledWith(123);
      expect(mockForm.controls.name.setValue).toHaveBeenCalledWith('Test Name');
      expect(mockForm.controls.guid.setValue).toHaveBeenCalledWith(456);
    });

    it('should log a warning for invalid field types', () => {
      service['updateFormAfterReload']();

      expect(consoleWarnSpy).toHaveBeenCalledWith("Field '123' is not a valid string key.");
      expect(consoleWarnSpy).toHaveBeenCalledWith("Field 'null' is not a valid string key.");
    });

    it('should not throw errors for valid but empty fields', () => {
      Object.defineProperty(service, 'fields', {
        value: [], // No fields to iterate
      });

      expect(() => service['updateFormAfterReload']()).not.toThrow();
    });

    it('should reset loading to false after execution', () => {
      service['_loading'] = true;

      service['updateFormAfterReload']();

      expect(service['_loading']).toBe(false); // Ensure loading is reset
    });
  });
});
