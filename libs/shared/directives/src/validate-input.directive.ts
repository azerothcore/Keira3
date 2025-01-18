import { Directive, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[keiraInputValidation]',
  standalone: true,
})
export class InputValidationDirective implements OnInit {
  @Input('keiraInputValidation') control!: AbstractControl | null;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (!this.control) {
      console.warn('ValidationDirective: No control provided.');
      return;
    }
  }

  @HostBinding('class.is-invalid')
  get isInvalid(): boolean {
    return !!this.control?.invalid && !!this.control?.touched;
  }
}
