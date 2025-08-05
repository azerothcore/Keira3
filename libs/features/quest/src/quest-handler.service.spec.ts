import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestHandlerService } from './quest-handler.service';

describe('QuestHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), QuestHandlerService],
    }),
  );

  it('should be created', () => {
    const service: QuestHandlerService = TestBed.inject(QuestHandlerService);
    expect(service).toBeTruthy();
  });
});
