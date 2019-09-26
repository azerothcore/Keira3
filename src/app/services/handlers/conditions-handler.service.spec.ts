import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ConditionsHandlerService } from './conditions-handler.service';
import { Conditions } from '../../types/conditions.type';

describe('ConditionsHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should run getIdObject() correctly', () => {
    const service: ConditionsHandlerService = TestBed.get(ConditionsHandlerService);
    expect(service).toBeTruthy();

    const input: Partial<Conditions> = {
      'SourceTypeOrReferenceId': 1,
      'SourceGroup': 2,
      'SourceEntry': 3,
      'SourceId': 4,
      'ElseGroup': 4,
      'ConditionTypeOrReference': 5,
      'ConditionTarget': 6,
      'ConditionValue1': 7,
      'ConditionValue2': 8,
      'ConditionValue3': 9,
      'test': 10
    };
    const output: Partial<Conditions> = {
      'SourceTypeOrReferenceId': 1,
      'SourceGroup': 2,
      'SourceEntry': 3,
      'SourceId': 4,
      'ElseGroup': 4,
      'ConditionTypeOrReference': 5,
      'ConditionTarget': 6,
      'ConditionValue1': 7,
      'ConditionValue2': 8,
      'ConditionValue3': 9,
    };

    const res = service['getIdObject'](input);
    expect(res).toEqual(output);

    service.select(true, input);
    expect(service.selected).toBe(JSON.stringify(res));
  });

});
