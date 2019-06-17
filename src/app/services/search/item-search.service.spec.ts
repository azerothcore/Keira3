import { TestBed } from '@angular/core/testing';

import { ItemSearchService } from './item-search.service';

describe('ItemSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ItemSearchService = TestBed.get(ItemSearchService);
    expect(service).toBeTruthy();
  });
});
