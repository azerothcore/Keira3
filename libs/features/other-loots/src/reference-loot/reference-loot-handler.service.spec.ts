import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

describe('ReferenceLootHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), ReferenceLootHandlerService],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(ReferenceLootHandlerService)).toBeTruthy();
  });

  it('select with sourceId and isNew should navigate to copy route', () => {
    const service = TestBed.inject(ReferenceLootHandlerService);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    service.select(true, 123, undefined, true, '1');

    expect(navigateSpy).toHaveBeenCalledWith(['other-loots/reference-copy']);
  });
});
