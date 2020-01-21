import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ConditionsService } from './conditions.service';
import { ConditionsHandlerService } from '../conditions-handler.service';

describe('ConditionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ConditionsHandlerService,
      ConditionsService,
    ],
  }));

  it('should be created', () => {
    const service: ConditionsService = TestBed.get(ConditionsService);
    expect(service).toBeTruthy();
  });
});
