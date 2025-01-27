import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { SubscriptionHandler } from '@keira/shared/utils';
import { ValidationService } from '@keira/shared/common-services';

@Directive({
  selector: '[keiraInputValidation]',
  standalone: true,
})
export class InputValidationDirective extends SubscriptionHandler implements OnInit {
  private readonly el: ElementRef = inject(ElementRef);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly ngControl: NgControl = inject(NgControl);
  private readonly validationService = inject(ValidationService);

  private errorDiv: HTMLElement | null = null;

  ngOnInit(): void {
    const control = this.ngControl.control;

    if (!control) {
      return;
    }

    this.subscriptions.push(
      control.statusChanges?.subscribe(() => {
        this.updateErrorMessage(control);
      }),
    );
  }

  private updateErrorMessage(control: AbstractControl | null): void {
    // Safely remove the existing errorDiv if it exists
    if (this.errorDiv) {
      const parent = this.el.nativeElement.parentNode;
      if (parent) {
        this.renderer.removeChild(parent, this.errorDiv);
      }
      this.errorDiv = null;
    }

    if (control?.invalid) {
      control.markAsTouched();
    }

    if (control?.touched && control?.invalid && control.errors && Object.keys(control.errors).length && this.el.nativeElement.parentNode) {
      const parent = this.el.nativeElement.parentNode;
      if (parent) {
        this.errorDiv = this.renderer.createElement('div');
        this.renderer.addClass(this.errorDiv, 'error-message');
        const errorMessage = control.errors?.['required'] ? 'This field is required' : 'Invalid field';

        const text = this.renderer.createText(errorMessage);
        this.renderer.appendChild(this.errorDiv, text);

        this.renderer.appendChild(parent, this.errorDiv);
      }
    }

    this.validationService.validationPassed$.next(!!control?.valid);
  }
}
