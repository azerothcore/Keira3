import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Conditions } from '@keira/acore-world-model';
import { ConditionsHandlerService } from './conditions-handler.service';

describe('ConditionsHandlerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [ConditionsHandlerService],
    }),
  );

  it('should run getIdObject() correctly', () => {
    const service: ConditionsHandlerService = TestBed.inject(ConditionsHandlerService);
    expect(service).toBeTruthy();

    const input: Partial<Conditions> = {
      SourceTypeOrReferenceId: 1,
      SourceGroup: 2,
      SourceEntry: 3,
      SourceId: 4,
      ElseGroup: 4,
      ConditionTypeOrReference: 5,
      ConditionTarget: 6,
      ConditionValue1: 7,
      ConditionValue2: 8,
      ConditionValue3: 9,
      test: 10,
    };
    const output: Partial<Conditions> = {
      SourceTypeOrReferenceId: 1,
      SourceGroup: 2,
      SourceEntry: 3,
      SourceId: 4,
      ElseGroup: 4,
      ConditionTypeOrReference: 5,
      ConditionTarget: 6,
      ConditionValue1: 7,
      ConditionValue2: 8,
      ConditionValue3: 9,
    };

    const res = service['getIdObject'](input);
    expect(res).toEqual(output);

    spyOn(TestBed.inject(Router), 'navigate');

    service.select(true, input);
    expect(service.selected).toBe(JSON.stringify(res));
  });
});
