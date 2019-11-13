import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import Spy = jasmine.Spy;

import { SaiEditorService } from './sai-editor.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';

describe('SAI Editor Service', () => {
  let service: SaiEditorService;

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
  });

  it('updateFullQuery should correctly work', () => {
    const queryService = TestBed.get(QueryService);
    const getFullDeleteInsertQuerySpy = spyOn(queryService, 'getFullDeleteInsertQuery').and.returnValue('-- Mock Query result');

    service['updateFullQuery']();

    expect(getFullDeleteInsertQuerySpy).toHaveBeenCalledTimes(1);
  });

});
