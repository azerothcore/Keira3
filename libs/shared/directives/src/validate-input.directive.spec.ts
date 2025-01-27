import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormControl, FormsModule, NgControl } from '@angular/forms';
import { InputValidationDirective } from './validate-input.directive';
import { ValidationService } from '@keira/shared/common-services';
import { take } from 'rxjs';

@Component({
  template: `
    <form>
      <div>
        <input type="text" [formControl]="testControl" keiraInputValidation />
      </div>
    </form>
  `,
})
class TestComponent {
  testControl = new FormControl('');
}

describe('InputValidationDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let validationService: ValidationService;
  let debugElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ReactiveFormsModule, FormsModule, InputValidationDirective], // Add the directive to imports
      providers: [ValidationService],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    validationService = TestBed.inject(ValidationService);
    debugElement = fixture.debugElement.query(By.directive(InputValidationDirective));
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = debugElement.injector.get(InputValidationDirective);
    expect(directive).toBeTruthy();
  });

  it('should display error message when control is invalid and touched', () => {
    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('This field is required');
  });

  it('should remove error message when control becomes valid', () => {
    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    let errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();

    // Make the control valid
    control?.clearValidators();
    control?.setValue('Valid value'); // Set a valid value
    control?.updateValueAndValidity();

    fixture.detectChanges();

    errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('should handle empty error object gracefully', () => {
    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({})); // No errors
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('should handle multiple error types gracefully', () => {
    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({ required: true, minlength: true })); // Multiple errors
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('This field is required'); // Test only the first error message
  });

  it('should not throw when control is null', () => {
    const ngControl = debugElement.injector.get(NgControl);
    spyOnProperty(ngControl, 'control', 'get').and.returnValue(null); // Mock control as null

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should not create duplicate error messages if errorDiv already exists', () => {
    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const initialErrorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(initialErrorDiv).toBeTruthy();

    // Trigger the updateErrorMessage logic again
    fixture.detectChanges();

    const updatedErrorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(updatedErrorDiv).toBe(initialErrorDiv); // Same errorDiv should remain
  });

  it('should not add error message if parentNode is null', () => {
    const control = debugElement.injector.get(NgControl).control;

    // Mock parentNode as null
    spyOnProperty(debugElement.nativeElement, 'parentNode', 'get').and.returnValue(null);

    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode?.querySelector('.error-message');
    expect(errorDiv).toBeFalsy(); // Error message should not be added
  });

  it('should update validationPassed$ in ValidationService', (done: DoneFn) => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    validationService.validationPassed$
      .pipe(take(1)) // Take only the first emission
      .subscribe((isValid) => {
        expect(isValid).toBe(false); // Initially invalid
        done();
      });

    // Test invalid state
    control?.setValue('');
    fixture.detectChanges();

    // Test valid state
    control?.setValue('Valid value');
    control?.updateValueAndValidity();
    fixture.detectChanges();
  });

  it('should set touched when control is invalid', () => {
    const control = debugElement.injector.get(NgControl).control;

    spyOn(control!, 'markAsTouched');
    control?.setValidators(() => ({ required: true }));
    control?.updateValueAndValidity();

    fixture.detectChanges();

    expect(control?.markAsTouched).toHaveBeenCalled();
  });

  it('should not create errorDiv if parentNode is null', () => {
    const control = debugElement.injector.get(NgControl).control;
    spyOnProperty(debugElement.nativeElement, 'parentNode', 'get').and.returnValue(null);

    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    expect(debugElement.nativeElement.parentNode?.querySelector('.error-message')).toBeFalsy();
  });
});
