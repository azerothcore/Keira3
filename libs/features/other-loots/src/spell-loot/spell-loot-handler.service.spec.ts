import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
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
});
