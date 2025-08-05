import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameTeleHandlerService } from './game-tele-handler.service';

describe('GameTeleHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), GameTeleHandlerService],
    }),
  );

  it('should be created', () => {
    const service: GameTeleHandlerService = TestBed.inject(GameTeleHandlerService);
    expect(service).toBeTruthy();
  });
});
