import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ReferenceLootHandlerService } from './reference-loot-handler.service';

describe('ReferenceLootHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      ReferenceLootHandlerService,
    ],
  }));

  it('should be created', () => {
    const service: ReferenceLootHandlerService = TestBed.inject(ReferenceLootHandlerService);
    expect(service).toBeTruthy();
  });
});
