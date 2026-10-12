import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { CreatureImmunitiesHandlerService } from './creature-immunities-handler.service';

describe('CreatureImmunitiesHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), provideRouter([]), CreatureImmunitiesHandlerService],
    });
  });

  const setup = () => {
    const service = TestBed.inject(CreatureImmunitiesHandlerService);
    return { service };
  };

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  it('should update isCreatureImmunitiesUnsaved status', () => {
    const { service } = setup();
    expect(service.isCreatureImmunitiesUnsaved()).toBe(false);

    service['_statusMap']['creature_immunities'].set(true);

    expect(service.isCreatureImmunitiesUnsaved()).toBe(true);
  });
});
