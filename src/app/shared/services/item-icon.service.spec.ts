import { TestBed } from '@angular/core/testing';

import { ItemIconService } from './item-icon.service';

describe('ItemIconService', () => {
  let service: ItemIconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemIconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
