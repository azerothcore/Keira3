import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { CreatureSearchService } from './creature-search.service';
import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';

describe('CreatureSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ]
  }));

  it('should be created', () => {
    const service: CreatureSearchService = TestBed.get(CreatureSearchService);
    expect(service).toBeTruthy();
  });
});
