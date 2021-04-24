import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SpellHandlerService } from './spell-handler.service';

describe('SpellHandlerService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      providers: [SpellHandlerService],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(SpellHandlerService);
    expect(service).toBeTruthy();
  });
});
