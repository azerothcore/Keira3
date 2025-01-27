import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormControl, FormsModule, NgControl, AbstractControl } from '@angular/forms';
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
      imports: [ReactiveFormsModule, FormsModule, InputValidationDirective],
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

    control?.clearValidators();
    control?.setValue('Valid value');
    control?.updateValueAndValidity();

    fixture.detectChanges();

    errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('should handle empty error object gracefully', () => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => null); // Simulate no errors
    control?.setValue('');
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull(); // Ensure no error message is created
  });

  it('should handle multiple error types and display first error', () => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ required: true, minlength: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('This field is required');
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

  it('should mark control as touched when invalid', () => {
    const control = debugElement.injector.get(NgControl).control;
    spyOn(control!, 'markAsTouched').and.callThrough();

    control?.setValidators(() => ({ required: true }));
    control?.setValue('');
    control?.updateValueAndValidity();

    fixture.detectChanges();

    expect(control?.markAsTouched).toHaveBeenCalled();
  });

  it('should update validationPassed$ with correct value', (done: DoneFn) => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ required: true }));
    control?.setValue('');
    control?.updateValueAndValidity();

    fixture.detectChanges();

    validationService.validationPassed$.pipe(take(1)).subscribe((isValid) => {
      expect(isValid).toBe(false);
      done();
    });

    control?.setValue('Valid value');
    control?.updateValueAndValidity();

    fixture.detectChanges();
  });

  it('should not throw error when ngControl.control is null', () => {
    const ngControl = debugElement.injector.get(NgControl);
    spyOnProperty(ngControl, 'control', 'get').and.returnValue(null);

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should safely remove errorDiv if already exists', () => {
    const control = debugElement.injector.get(NgControl).control;

    // Set invalid state to create an errorDiv
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    let errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();

    // Re-trigger the update with no errors
    control?.clearValidators();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('should not throw error if errorDiv is already null', () => {
    const directive = debugElement.injector.get(InputValidationDirective);
    directive['errorDiv'] = null; // Manually set to null
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should handle statusChanges being null gracefully', () => {
    const control = debugElement.injector.get(NgControl).control as AbstractControl;

    // Mock the control to have statusChanges as null
    Object.defineProperty(control, 'statusChanges', {
      get: () => null,
    });

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should not throw error if control.errors is null', () => {
    const control = debugElement.injector.get(NgControl).control as AbstractControl;

    // Mock the control to have errors as null
    Object.defineProperty(control, 'errors', {
      get: () => null,
    });

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('should not add errorDiv if parentNode is null', () => {
    spyOnProperty(debugElement.nativeElement, 'parentNode', 'get').and.returnValue(null);

    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    expect(debugElement.nativeElement.parentNode?.querySelector('.error-message')).toBeFalsy();
  });

  it('should return early if control is null', () => {
    const ngControl = debugElement.injector.get(NgControl);
    spyOnProperty(ngControl, 'control', 'get').and.returnValue(null);

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should display correct error message for "required" error', () => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('This field is required');
  });

  it('should display "Invalid field" for non-required errors', () => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ minlength: { requiredLength: 5, actualLength: 3 } }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('Invalid field');
  });

  it('should handle control.errors being null without creating errorDiv', () => {
    const ngControl = debugElement.injector.get(NgControl);

    // Create a FormControl instance to mock AbstractControl
    const controlMock = new FormControl();

    // Directly assign null to the errors property
    Object.defineProperty(controlMock, 'errors', {
      get: () => null,
      configurable: true,
    });

    // Replace the ngControl's control with the mock control
    spyOnProperty(ngControl, 'control', 'get').and.returnValue(controlMock);

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull(); // Verify no errorDiv is created
  });

  it('should not throw error if control.errors is undefined', () => {
    const control = debugElement.injector.get(NgControl).control as AbstractControl;

    // Mock the control to have errors as undefined
    Object.defineProperty(control, 'errors', {
      get: () => undefined,
    });

    expect(() => {
      fixture.detectChanges();
    }).not.toThrow();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('should return early if control is null', () => {
    const ngControl = debugElement.injector.get(NgControl);

    // Mock ngControl.control to be null
    spyOnProperty(ngControl, 'control', 'get').and.returnValue(null);

    expect(() => {
      fixture.detectChanges(); // Triggers ngOnInit
    }).not.toThrow();

    // Verify no errorDiv is created
    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  });

  it('should return early if control is null (explicit)', () => {
    const directive = debugElement.injector.get(InputValidationDirective);
    const ngControl = debugElement.injector.get(NgControl);

    // Mock ngControl.control to be null
    spyOnProperty(ngControl, 'control', 'get').and.returnValue(null);

    // Spy on the updateErrorMessage method to ensure it's not called
    const updateErrorMessageSpy = spyOn<any>(directive, 'updateErrorMessage');

    // Call the method explicitly
    directive.ngOnInit();

    // Expect the method to exit early and not proceed further
    expect(updateErrorMessageSpy).not.toHaveBeenCalled();
  });
});
