import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameobjectHandlerService } from './gameobject-handler.service';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';

describe('GameobjectHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), GameobjectHandlerService, SaiGameobjectHandlerService],
    }),
  );

  it('should be created', () => {
    const service: GameobjectHandlerService = TestBed.inject(GameobjectHandlerService);
    expect(service).toBeTruthy();
  });
});
