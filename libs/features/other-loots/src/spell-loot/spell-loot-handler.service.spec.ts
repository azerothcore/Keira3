import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SpellLootHandlerService } from './spell-loot-handler.service';

describe('SpellLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), SpellLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SpellLootHandlerService)).toBeTruthy();
  });

  it('select with sourceId and isNew should navigate to spell copy route', () => {
    const service = TestBed.inject(SpellLootHandlerService);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    service.select(true, 123, undefined, true, '1');

    expect(navigateSpy).toHaveBeenCalledWith(['other-loots/spell-copy']);
  });
});
