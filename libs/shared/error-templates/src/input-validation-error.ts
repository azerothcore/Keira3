import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'keira-validation-feedback',
  standalone: true,
  template: `
    @if (control?.invalid && control?.touched) {
      <div class="">
        {{ errorMessage }}
      </div>
    }
  `,
})
export class ValidationFeedbackComponent {
  @Input() control!: AbstractControl | null;

  get errorMessage(): string {
    if (this.control?.errors?.['required']) {
      return 'This field is required';
    }
    return 'Invalid field';
  }
}
