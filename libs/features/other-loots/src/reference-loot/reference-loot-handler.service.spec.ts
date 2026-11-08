import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
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

  it('select with sourceId and isNew should navigate to copy route', () => {
    const service = TestBed.inject(ReferenceLootHandlerService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.select(true, 123, undefined, true, '1');

    expect(navigateSpy).toHaveBeenCalledWith(['other-loots/reference-copy']);
  });
});
