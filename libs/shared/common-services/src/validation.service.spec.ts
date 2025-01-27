import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationService],
    });

    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have a default value of true for validationPassed$', (done: DoneFn) => {
    service.validationPassed$.subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
  });

  it('should emit the updated value when validationPassed$ changes', (done: DoneFn) => {
    // Emit a new value
    service.validationPassed$.next(false);

    // Subscribe and verify the updated value
    service.validationPassed$.subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });
});
