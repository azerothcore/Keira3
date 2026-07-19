import { TestBed } from '@angular/core/testing';
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
});
