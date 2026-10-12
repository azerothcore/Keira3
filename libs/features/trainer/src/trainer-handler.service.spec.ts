import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TrainerHandlerService } from './trainer-handler.service';

describe('TrainerHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), TrainerHandlerService],
    });
  });

  const setup = () => {
    const service = TestBed.inject(TrainerHandlerService);
    return { service };
  };

  it('should update isTrainerUnsaved status', () => {
    const { service } = setup();
    expect(service.isTrainerUnsaved()).toBe(false);

    service['_statusMap']['trainer'].set(true);

    expect(service.isTrainerUnsaved()).toBe(true);
  });

  it('should update isTrainerSpellUnsaved status', () => {
    const { service } = setup();
    expect(service.isTrainerSpellUnsaved()).toBe(false);

    service['_statusMap']['trainer_spell'].set(true);

    expect(service.isTrainerSpellUnsaved()).toBe(true);
  });
});
