import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { GossipHandlerService } from './gossip-handler.service';

describe('GossipHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: GossipHandlerService = TestBed.get(GossipHandlerService);
    expect(service).toBeTruthy();
  });
});
