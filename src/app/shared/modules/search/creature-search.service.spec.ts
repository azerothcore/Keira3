import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { CreatureSearchService } from './creature-search.service';
import { QueryService } from '../../services/query.service';
import { MockedQueryService } from '../../testing/mocks';

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
