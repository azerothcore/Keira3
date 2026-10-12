import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameTeleHandlerService } from './game-tele-handler.service';

describe('GameTeleHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), GameTeleHandlerService],
    }),
  );

  it('should be created', () => {
    const service: GameTeleHandlerService = TestBed.inject(GameTeleHandlerService);
    expect(service).toBeTruthy();
  });
});
