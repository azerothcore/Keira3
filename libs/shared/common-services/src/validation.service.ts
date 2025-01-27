import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  public validationPassed$: BehaviorSubject<boolean> = new BehaviorSubject(true);
}
