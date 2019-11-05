import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SaiHandlerService } from './sai-handler.service';
import { QueryService } from '../query.service';
import { of } from 'rxjs';

describe('SaiHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  for (const { testId, sourceType, entryOrGuid, isNew } of [
    { testId: 1, sourceType: 1, entryOrGuid: 111, isNew: true },
    { testId: 2, sourceType: 2, entryOrGuid: 222, isNew: false },
  ]) {
    it(`selectFromEntity() should correctly work [${testId}]`, fakeAsync(() => {
      const service: SaiHandlerService = TestBed.get(SaiHandlerService);
      const queryService: QueryService = TestBed.get(QueryService);
      const mockResults = isNew ? [] : ['some result'];
      spyOn(queryService, 'query').and.returnValue(of({ results: mockResults } as any));
      spyOn(service, 'select');

      service.selectFromEntity(sourceType, entryOrGuid);
      tick();

      expect(queryService.query).toHaveBeenCalledTimes(1);
      expect(queryService.query).toHaveBeenCalledWith(
        `SELECT * FROM smart_scripts WHERE source_type = ${sourceType} AND entryorguid = ${entryOrGuid}`
      );
      expect(service.select).toHaveBeenCalledTimes(1);
      expect(service.select).toHaveBeenCalledWith(isNew, { source_type: sourceType, entryorguid: entryOrGuid });
    }));
  }

});
