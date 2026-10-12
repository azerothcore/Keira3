import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

describe('ReferenceLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), ReferenceLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(ReferenceLootHandlerService)).toBeTruthy();
  });
});
