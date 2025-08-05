import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MailLootHandlerService } from './mail-loot-handler.service';

describe('MailLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), MailLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(MailLootHandlerService)).toBeTruthy();
  });
});
