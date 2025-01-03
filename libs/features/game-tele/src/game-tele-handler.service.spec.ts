import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameTeleHandlerService } from './game-tele-handler.service';

describe('GameTeleHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [GameTeleHandlerService],
    }),
  );

  it('should be created', () => {
    const service: GameTeleHandlerService = TestBed.inject(GameTeleHandlerService);
    expect(service).toBeTruthy();
  });
});
