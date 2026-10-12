import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { GameobjectHandlerService } from './gameobject-handler.service';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';

describe('GameobjectHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    const service: GameobjectHandlerService = TestBed.inject(GameobjectHandlerService);
    expect(service).toBeTruthy();
  });
});
