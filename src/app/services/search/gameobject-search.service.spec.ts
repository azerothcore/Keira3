import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { GameobjectSearchService } from './gameobject-search.service';
import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';

describe('GameobjectSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ]
  }));

  it('should be created', () => {
    const service: GameobjectSearchService = TestBed.get(GameobjectSearchService);
    expect(service).toBeTruthy();
  });
});
