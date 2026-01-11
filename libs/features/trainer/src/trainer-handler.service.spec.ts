import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TrainerHandlerService } from './trainer-handler.service';

describe('TrainerHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), TrainerHandlerService],
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
