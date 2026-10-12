import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { QuestHandlerService } from './quest-handler.service';

describe('QuestHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), QuestHandlerService],
    }),
  );

  it('should be created', () => {
    const service: QuestHandlerService = TestBed.inject(QuestHandlerService);
    expect(service).toBeTruthy();
  });
});
