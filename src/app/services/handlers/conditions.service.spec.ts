import { TestBed } from '@angular/core/testing';

import { ConditionsService } from './conditions.service';

describe('ConditionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConditionsService = TestBed.get(ConditionsService);
    expect(service).toBeTruthy();
  });
});
