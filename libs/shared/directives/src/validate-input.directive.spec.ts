import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormControl, FormsModule, NgControl, FormControlStatus } from '@angular/forms';
import { InputValidationDirective } from './validate-input.directive';
import { ValidationService } from '@keira/shared/common-services';
import { Observable, take } from 'rxjs';

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
    const control = debugElement.injector.get(NgControl).control;

    // Mock the statusChanges property as null
    spyOnProperty(control!, 'statusChanges', 'get').and.returnValue(null as unknown as Observable<FormControlStatus>);

    expect(() => {
      fixture.detectChanges();
      control?.updateValueAndValidity();
    }).not.toThrow();
  });

  it('should not throw error if control.errors is null', () => {
    const control = debugElement.injector.get(NgControl).control;
    spyOnProperty(control!, 'errors', 'get').and.returnValue(null);

    fixture.detectChanges();

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
});
