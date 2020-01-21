import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { SaiEditorService } from './sai-editor.service';
import { QueryService } from '../../shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { SaiHandlerService } from '../../shared/modules/sai-editor/sai-handler.service';
import { SmartScripts } from '@keira-types/smart-scripts.type';

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
      { provide: ToastrService, useValue: instance(MockedToastrService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(SaiEditorService);
    handlerService = TestBed.get(SaiHandlerService);
    queryService = TestBed.get(QueryService);
  });


  it('checks linked event', () => {

    const mockRows: Partial<SmartScripts>[] = [
      { entryorguid: 0, source_type: 0, id: 0, link: 1, event_type: 0  },
      { entryorguid: 0, source_type: 0, id: 1, link: 0, event_type: 61 }
    ];

    service['_newRows'] = mockRows as SmartScripts[];
    expect(service.errors.length).toBe(0);
    expect(service.errorLinkedEvent).toBe(false);

    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(0);
    expect(service.errorLinkedEvent).toBe(false);

    mockRows[1].event_type = 0;
    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(1);
    expect(service.errors[0]).toContain(`ERROR: the SAI (id: `);
    expect(service.errorLinkedEvent).toBe(true);

    mockRows[1].link = 3;
    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(2);
    expect(service.errors[1]).toContain(`ERROR: non-existing links:`);

    mockRows[0].link = 0;
    mockRows[1].link = 0;
    service['checkRowsCorrectness']();
    expect(service.errors.length).toBe(0);
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
