import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GossipHandlerService } from './gossip-handler.service';

describe('GossipHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), GossipHandlerService],
    }),
  );

  it('should be created', () => {
    const service: GossipHandlerService = TestBed.inject(GossipHandlerService);
    expect(service).toBeTruthy();
  });
});
