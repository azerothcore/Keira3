import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import Spy = jasmine.Spy;

import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { SingleRowEditorService } from './single-row-editor.service';
import { MockSingleRowEditorService, MockEntity, MockHandlerService } from '@keira-testing/mock-services';


describe('SingleRowEditorService', () => {
  let service: SingleRowEditorService<MockEntity>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },

    ],
  }));

  beforeEach(() => {
    service = TestBed.inject(MockSingleRowEditorService);
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

      service.form.controls['id'].setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(0);
    });

    it('when loading is false and the form is not dirty, should update only the full query', () => {
      service.form.markAsPristine();

      service.form.controls['id'].setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('when loading is false and the form dirty, should update both the queries', () => {
      service.form.markAsDirty();

      service.form.controls['id'].setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('modifying the form twice with the same value should not have effect', () => {
      service.form.markAsDirty();

      service.form.controls['id'].setValue(123);
      service.form.controls['id'].setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(1);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });
  });

  it('updateDiffQuery() should correctly work', () => {
    service['_diffQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getUpdateQuery').and.returnValue(queryResult);

    service['updateDiffQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      service['_entityIdField'],
      service['originalValue'],
      service.form.getRawValue(),
    );
    expect(service.diffQuery).toEqual(queryResult);
  });

  it('updateFullQuery() should correctly work', () => {
    service['_fullQuery'] = '';
    const queryResult = '-- Mock query result';
    const getQuerySpy = spyOn(TestBed.inject(MysqlQueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

    service['updateFullQuery']();

    expect(getQuerySpy).toHaveBeenCalledTimes(1);
    expect(getQuerySpy).toHaveBeenCalledWith(
      service.entityTable,
      [service.form.getRawValue()],
      service['_entityIdField'],
    );
    expect(service.fullQuery).toEqual(queryResult);
  });

  describe('onReloadSuccessful()', () => {
    const id = 123456;
    let updateFullQuerySpy: Spy;

    beforeEach(() => {
      updateFullQuerySpy = spyOn<any>(service, 'updateFullQuery');
    });

    it('should correctly work when loading an existing entity [as main entity]', () => {
      const handlerService = TestBed.inject(MockHandlerService);
      const entity: MockEntity = { id, guid: 12345, name: 'myName' };
      const data = [entity];
      handlerService.isNew = true;

      service['onReloadSuccessful'](data, id);

      expect(service['_originalValue']).toEqual(data[0]);
      expect(service.isNew).toBe(false);

      expect(handlerService.isNew).toBe(false);
      expect(handlerService.selectedName).toBe(`${service['_originalValue'][service['_entityNameField']]}`);

      expect(service.form.getRawValue()).toEqual(entity);
      expect(service.loadedEntityId).toEqual(`${entity.id}`);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('should correctly work when loading an existing entity [as non-main entity]', () => {
      const handlerService = TestBed.inject(MockHandlerService);
      const entity: MockEntity = { id, guid: 12345, name: 'myName' };
      const data = [entity];
      handlerService.isNew = true;
      service['isMainEntity'] = false;

      service['onReloadSuccessful'](data, id);

      expect(service['_originalValue']).toEqual(data[0]);
      expect(service.isNew).toBe(false);

      expect(handlerService.isNew).toBe(true);
      expect(handlerService.selectedName).toBe(undefined);

      expect(service.form.getRawValue()).toEqual(entity);
      expect(service.loadedEntityId).toEqual(`${entity.id}`);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });

    it('should correctly work when creating a new entity', () => {
      const data = [];

      service['onReloadSuccessful'](data, id);

      expect(service.form.getRawValue()).toEqual({ id, guid: 0, name: '' });
      expect(service.loadedEntityId).toEqual(`${id}`);
      expect(service.isNew).toBe(true);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
    });
  });
});
