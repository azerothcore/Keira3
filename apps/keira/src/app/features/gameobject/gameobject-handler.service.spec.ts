import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameobjectHandlerService } from './gameobject-handler.service';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';

describe('GameobjectHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [GameobjectHandlerService, SaiGameobjectHandlerService],
    }),
  );

  it('should be created', () => {
    const service: GameobjectHandlerService = TestBed.inject(GameobjectHandlerService);
    expect(service).toBeTruthy();
  });
});
