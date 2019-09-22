import { TestBed } from '@angular/core/testing';

import { ConditionsHandlerService } from './conditions-handler.service';

describe('ConditionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConditionsHandlerService = TestBed.get(ConditionsHandlerService);
    expect(service).toBeTruthy();
  });
});
