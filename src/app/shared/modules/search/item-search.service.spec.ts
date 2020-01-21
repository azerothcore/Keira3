import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { ItemSearchService } from './item-search.service';
import { QueryService } from '../../services/query.service';
import { MockedQueryService } from '../../testing/mocks';

describe('ItemSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ]
  }));

  it('should be created', () => {
    const service: ItemSearchService = TestBed.get(ItemSearchService);
    expect(service).toBeTruthy();
  });
});
