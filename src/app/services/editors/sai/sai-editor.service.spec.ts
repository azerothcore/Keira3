import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { SaiEditorService } from './sai-editor.service';
import { QueryService } from '../../query.service';
import { MockedQueryService, MockedToastrService } from '../../../test-utils/mocks';
import { SaiHandlerService } from '../../handlers/sai-handler.service';
import { SmartScripts } from '../../../types/smart-scripts.type';

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

    const mockRows: SmartScripts[] = [
      {
        entryorguid: 0,
        source_type: 0,
        id: 0,
        link: 1,
        event_type: 0,
        event_phase_mask: 0,
        event_chance: 100,
        event_flags: 0,
        event_param1: 0,
        event_param2: 0,
        event_param3: 0,
        event_param4: 0,
        event_param5: 0,
        action_type: 0,
        action_param1: 0,
        action_param2: 0,
        action_param3: 0,
        action_param4: 0,
        action_param5: 0,
        action_param6: 0,
        target_type: 0,
        target_param1: 0,
        target_param2: 0,
        target_param3: 0,
        target_param4: 0,
        target_x: 0,
        target_y: 0,
        target_z: 0,
        target_o: 0,
        comment: '',
      },
      {
        entryorguid: 0,
        source_type: 0,
        id: 1,
        link: 0,
        event_type: 61,
        event_phase_mask: 0,
        event_chance: 100,
        event_flags: 0,
        event_param1: 0,
        event_param2: 0,
        event_param3: 0,
        event_param4: 0,
        event_param5: 0,
        action_type: 0,
        action_param1: 0,
        action_param2: 0,
        action_param3: 0,
        action_param4: 0,
        action_param5: 0,
        action_param6: 0,
        target_type: 0,
        target_param1: 0,
        target_param2: 0,
        target_param3: 0,
        target_param4: 0,
        target_x: 0,
        target_y: 0,
        target_z: 0,
        target_o: 0,
        comment: '',
      }
    ];

    service['_newRows'] = mockRows;
    expect(service.errors.length === 0).toBe(true);
    expect(service.errorLinkedEvent).toBe(false);

    service['checkRowsCorrectness']();
    expect(service.errors.length === 0).toBe(true);
    expect(service.errorLinkedEvent).toBe(false);

    mockRows[1].event_type = 0;
    service['checkRowsCorrectness']();
    expect(service.errors.length === 1).toBe(true);
    expect(service.errors[0]).toContain('ERROR: the SAI (id: ');
    expect(service.errorLinkedEvent).toBe(true);

    mockRows[1].link = 3;
    service['checkRowsCorrectness']();
    expect(service.errors.length === 2).toBe(true);
    expect(service.errors[1]).toContain('ERROR: non-existing links:');

    mockRows[0].link = 0;
    mockRows[1].link = 0;
    service['checkRowsCorrectness']();
    expect(service.errors.length === 0).toBe(true);
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
