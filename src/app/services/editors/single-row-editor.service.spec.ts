import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import Spy = jasmine.Spy;

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { SingleRowEditorService } from './single-row-editor.service';
import { MockEditorService, MockEntity, MockHandlerService } from '../../test-utils/mock-services';


fdescribe('SingleRowEditorService', () => {
  let service: SingleRowEditorService<MockEntity>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(MockEditorService);
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

    it('when loading is false and the form is not dirty, should update only the full query', () => {
      service.form.markAsPristine();

      service.form.get('id').setValue(123);

      expect(updateDiffQuerySpy).toHaveBeenCalledTimes(0);
      expect(updateFullQuerySpy).toHaveBeenCalledTimes(1);
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
    const getQuerySpy = spyOn(TestBed.get(QueryService), 'getUpdateQuery').and.returnValue(queryResult);

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
    const getQuerySpy = spyOn(TestBed.get(QueryService), 'getFullDeleteInsertQuery').and.returnValue(queryResult);

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

    it('should correctly work when loading an existing entity', () => {
      const handlerService = TestBed.get(MockHandlerService);
      const data = { results: [{ id: 123, guid: 12345, name: 'myName' }] };

      service['onReloadSuccessful'](data, id);

      expect(service['_originalValue']).toEqual(data.results[0]);
      expect(service.isNew).toBe(false);

      expect(handlerService.isNew).toBe(false);
      expect(handlerService.selectedName).toBe(`${service['_originalValue'][service['_entityNameField']]}`);
    });
  });
});
