import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ToastrModule } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { TrainerHandlerService } from '../trainer-handler.service';
import { TrainerSpellService } from './trainer-spell.service';

describe('TrainerSpellService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        TrainerHandlerService,
      ],
    });
  });

  const setup = () => {
    const service = TestBed.inject(TrainerSpellService);
    return { service };
  };

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  it('should have correct entity table', () => {
    const { service } = setup();
    expect(service['_entityTable']).toBe('trainer_spell');
  });

  it('should have correct entity id field', () => {
    const { service } = setup();
    expect(service['_entityIdField']).toBe('TrainerId');
  });

  it('should have correct entity second id field', () => {
    const { service } = setup();
    expect(service['_entitySecondIdField']).toBe('SpellId');
  });
});
