import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { SubscriptionHandler } from '@keira/shared/utils';

@Directive({
  selector: '[keiraInputValidation]',
  standalone: true,
})
export class InputValidationDirective extends SubscriptionHandler implements OnInit {
  private readonly el: ElementRef = inject(ElementRef);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly ngControl: NgControl = inject(NgControl);

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

  private updateErrorMessage(control: AbstractControl): void {
    if (this.errorDiv) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.errorDiv);
      this.errorDiv = null;
    }

    if (control?.touched && control?.invalid) {
      const errorMessage = control?.errors?.['required'] ? 'This field is required' : 'Invalid field';

      this.errorDiv = this.renderer.createElement('div');

      const text = this.renderer.createText(errorMessage);
      this.renderer.appendChild(this.errorDiv, text);

      const parent = this.el.nativeElement.parentNode;
      this.renderer.appendChild(parent, this.errorDiv);
    }
  }
}
