import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { SpellHandlerService } from './spell-handler.service';

describe('SpellHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), SpellHandlerService],
    });
  });

  it('should have the unsaved status getters', () => {
    const service = TestBed.inject(SpellHandlerService);
    expect(service.isSpellDbcUnsaved).toBeDefined();
  });
});
