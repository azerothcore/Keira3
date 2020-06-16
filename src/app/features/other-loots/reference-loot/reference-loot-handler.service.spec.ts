import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

describe('CreatureHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      ReferenceLootHandlerService,
      SaiCreatureHandlerService,
    ],
  }));

  it('should be created', () => {
    const service: ReferenceLootHandlerService = TestBed.inject(ReferenceLootHandlerService);
    expect(service).toBeTruthy();
  });
});
