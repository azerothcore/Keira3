import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private readonly controlsValidityMap = new Map<any, boolean>();
  readonly validationPassed$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  setControlValidity(control: any, isValid: boolean): void {
    this.controlsValidityMap.set(control, isValid);
    this.updateValidationState();
  }

  removeControl(control: any): void {
    this.controlsValidityMap.delete(control);
    this.updateValidationState();
  }

  private updateValidationState(): void {
    const allValid = Array.from(this.controlsValidityMap.values()).every((isValid) => isValid);
    this.validationPassed$.next(allValid);
  }
}
