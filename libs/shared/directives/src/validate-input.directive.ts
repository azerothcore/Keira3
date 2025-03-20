import { Directive, ElementRef, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { SubscriptionHandler } from '@keira/shared/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ValidationService } from '@keira/shared/common-services';

@Directive({
  selector: '[keiraInputValidation]',
  standalone: true,
})
export class InputValidationDirective extends SubscriptionHandler implements OnInit, OnDestroy {
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

    this.validationService.setControlValidity(this, control.valid);

    this.subscriptions.push(
      control.statusChanges?.pipe(distinctUntilChanged(), debounceTime(500)).subscribe(() => {
        this.updateErrorMessage(control);
        this.validationService.setControlValidity(this, control.valid);
      }),
    );
  }

  override ngOnDestroy(): void {
    this.validationService.removeControl(this);
    super.ngOnDestroy();
  }

  private updateErrorMessage(control: AbstractControl | null): void {
    if (this.errorDiv) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.errorDiv);
      this.errorDiv = null;
    }

    if (control?.invalid) {
      control.markAsTouched();
    }

    if (control?.touched && control?.invalid && control.errors) {
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
  }
}
