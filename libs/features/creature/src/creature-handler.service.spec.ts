import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureHandlerService } from './creature-handler.service';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

describe('CreatureHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), CreatureHandlerService, SaiCreatureHandlerService],
    }),
  );

  it('should be created', () => {
    const service: CreatureHandlerService = TestBed.inject(CreatureHandlerService);
    expect(service).toBeTruthy();
  });
});
