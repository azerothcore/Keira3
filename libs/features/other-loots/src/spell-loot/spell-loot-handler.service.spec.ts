import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SpellLootHandlerService } from './spell-loot-handler.service';

describe('SpellLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), SpellLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SpellLootHandlerService)).toBeTruthy();
  });

  it('select with sourceId and isNew should navigate to spell copy route', () => {
    const service = TestBed.inject(SpellLootHandlerService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.select(true, 123, undefined, true, '1');

    expect(navigateSpy).toHaveBeenCalledWith(['other-loots/spell-copy']);
  });
});
