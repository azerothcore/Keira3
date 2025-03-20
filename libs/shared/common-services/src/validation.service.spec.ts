import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';
import { take } from 'rxjs/operators';

describe('ValidationService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [ValidationService],
    }),
  );

  function setup(): { service: ValidationService } {
    const service = TestBed.inject(ValidationService);
    return { service };
  }

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  it('should have a default value of true for validationPassed$', (done: DoneFn) => {
    const { service } = setup();
    service.validationPassed$.pipe(take(1)).subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
  });

  it('should set control validity and update validationPassed$', (done: DoneFn) => {
    const { service } = setup();
    service.setControlValidity('control1', false);

    service.validationPassed$.pipe(take(1)).subscribe((value) => {
      expect(value).toBe(false); // Validation should be false

      // Update control to valid
      service.setControlValidity('control1', true);

      service.validationPassed$.pipe(take(1)).subscribe((newValue) => {
        expect(newValue).toBe(true); // Validation should be true
        done();
      });
    });
  });

  it('should handle removing non-existing controls gracefully', (done: DoneFn) => {
    const { service } = setup();
    service.removeControl('nonExistentControl');

    service.validationPassed$.pipe(take(1)).subscribe((value) => {
      expect(value).toBe(true); // No change in validation state
      done();
    });
  });

  it('should correctly update validation state with multiple controls', (done: DoneFn) => {
    const { service } = setup();
    service.setControlValidity('control1', true);
    service.setControlValidity('control2', true);
    service.setControlValidity('control3', false);

    service.validationPassed$.pipe(take(1)).subscribe((value) => {
      expect(value).toBe(false); // validation should be false because control3 is invalid

      // Update control3 to valid
      service.setControlValidity('control3', true);

      service.validationPassed$.pipe(take(1)).subscribe((newValue) => {
        expect(newValue).toBe(true); // validation should now be true
        done();
      });
    });
  });
});
