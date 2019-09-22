import { Injectable } from '@angular/core';
import { Conditions } from '../../types/conditions.type';

@Injectable({
  providedIn: 'root',
})
export class ConditionsService {
  isNew = false;
  selected: Partial<Conditions>;
}
