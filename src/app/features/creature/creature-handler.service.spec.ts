import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CreatureHandlerService } from './creature-handler.service';

describe('CreatureHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: CreatureHandlerService = TestBed.get(CreatureHandlerService);
    expect(service).toBeTruthy();
  });
});
