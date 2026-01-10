import { TestBed } from '@angular/core/testing';
import { TrainerHandlerService } from './trainer-handler.service';

describe('TrainerHandlerService', () => {
  let service: TrainerHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainerHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
