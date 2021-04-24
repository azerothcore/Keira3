import { TestBed } from '@angular/core/testing';

import { SelectSpellService } from './select-spell.service';

describe('SelectSpellService', () => {
  let service: SelectSpellService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectSpellService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
