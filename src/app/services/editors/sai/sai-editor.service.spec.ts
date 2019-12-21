import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SaiEditorService } from './sai-editor.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';
import { SaiHandlerService } from '../../handlers/sai-handler.service';

describe('SAI Editor Service', () => {
  let service: SaiEditorService;
  let handlerService: SaiHandlerService;
  let queryService: QueryService;

  const mockQuery = '-- Mock Query result';

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(SaiEditorService);
    handlerService = TestBed.get(SaiHandlerService);
    queryService = TestBed.get(QueryService);
  });

  describe('when templateQuery is null', () => {
    beforeEach(() => {
      handlerService['_templateQuery'] = null;
    });

    it('updateFullQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getFullDeleteInsertQuery').and.returnValue(mockQuery);

      service['updateFullQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_fullQuery']).toEqual(mockQuery);
    });

    it('updateDiffQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(mockQuery);

      service['updateDiffQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_diffQuery']).toEqual(mockQuery);
    });
  });

  describe('when templateQuery is defined', () => {
    const mockTemplateQuery = '-- Mock Template Query result';
    const expectedQuery = `${mockTemplateQuery}\n\n${mockQuery}`;

    beforeEach(() => {
      handlerService['_templateQuery'] = mockTemplateQuery;
    });

    it('updateFullQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getFullDeleteInsertQuery').and.returnValue(mockQuery);

      service['updateFullQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_fullQuery']).toEqual(expectedQuery);
    });

    it('updateDiffQuery should correctly work', () => {
      const spy = spyOn(queryService, 'getDiffDeleteInsertTwoKeysQuery').and.returnValue(mockQuery);

      service['updateDiffQuery']();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(service['_diffQuery']).toEqual(expectedQuery);
    });
  });
});
