import { Injectable } from '@angular/core';
import { Conditions } from '../../types/conditions.type';

@Injectable({
  providedIn: 'root',
})
export class ConditionsHandlerService {
  isNew = false;
  selected: Partial<Conditions>;
}
