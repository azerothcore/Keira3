import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MailLootHandlerService } from './mail-loot-handler.service';

describe('MailLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), MailLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(MailLootHandlerService)).toBeTruthy();
  });
});
