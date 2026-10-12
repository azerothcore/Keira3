import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

describe('FishingLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), FishingLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(FishingLootHandlerService)).toBeTruthy();
  });
});
