import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ConditionsHandlerService } from './conditions-handler.service';

describe('ConditionsHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ]
  }));

  it('should be created', () => {
    const service: ConditionsHandlerService = TestBed.get(ConditionsHandlerService);
    expect(service).toBeTruthy();
  });
});
