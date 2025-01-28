import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormControl, FormsModule, NgControl } from '@angular/forms';
import { InputValidationDirective } from './validate-input.directive';
import { ValidationService } from '@keira/shared/common-services';

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
  let debugElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ReactiveFormsModule, FormsModule, InputValidationDirective],
      providers: [ValidationService],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    debugElement = fixture.debugElement.query(By.directive(InputValidationDirective));
    fixture.detectChanges();
  });

  it('should display error message when control is invalid and touched', fakeAsync(() => {
    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('This field is required');
  }));

  it('should remove error message when control becomes valid', fakeAsync(() => {
    const control = debugElement.injector.get(NgControl).control;
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    let errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();

    control?.clearValidators();
    control?.setValue('Valid value');
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime again
    fixture.detectChanges();

    errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  }));

  it('should handle multiple error types and display first error', fakeAsync(() => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ required: true, minlength: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('This field is required');
  }));

  it('should mark control as touched when invalid', fakeAsync(() => {
    const control = debugElement.injector.get(NgControl).control;
    spyOn(control!, 'markAsTouched').and.callThrough();

    control?.setValidators(() => ({ required: true }));
    control?.setValue('');
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    expect(control?.markAsTouched).toHaveBeenCalled();
  }));

  it('should safely remove errorDiv if already exists', fakeAsync(() => {
    const control = debugElement.injector.get(NgControl).control;

    // Set invalid state to create an errorDiv
    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    let errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();

    // Re-trigger the update with no errors
    control?.clearValidators();
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeNull();
  }));

  it('should display correct error message for "required" error', fakeAsync(() => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ required: true }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('This field is required');
  }));

  it('should display "Invalid field" for non-required errors', fakeAsync(() => {
    const control = debugElement.injector.get(NgControl).control;

    control?.setValidators(() => ({ minlength: { requiredLength: 5, actualLength: 3 } }));
    control?.markAsTouched();
    control?.updateValueAndValidity();

    tick(500); // Simulate debounceTime
    fixture.detectChanges();

    const errorDiv = debugElement.nativeElement.parentNode.querySelector('.error-message');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toBe('Invalid field');
  }));

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
