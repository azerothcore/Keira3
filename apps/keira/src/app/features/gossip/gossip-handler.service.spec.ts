import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GossipHandlerService } from './gossip-handler.service';

describe('GossipHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [GossipHandlerService],
    }),
  );

  it('should be created', () => {
    const service: GossipHandlerService = TestBed.inject(GossipHandlerService);
    expect(service).toBeTruthy();
  });
});
