import { TestBed } from '@angular/core/testing';

import { SpellHandlerService } from './spell-handler.service';

describe('SpellHandlerService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(SpellHandlerService);
    expect(service).toBeTruthy();
  });
});
