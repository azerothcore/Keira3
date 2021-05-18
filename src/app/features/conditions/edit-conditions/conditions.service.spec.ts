import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ConditionsService } from './conditions.service';
import { ConditionsHandlerService } from '../conditions-handler.service';

describe('ConditionsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        ConditionsHandlerService,
        ConditionsService,
      ],
    }),
  );

  it('should be created', () => {
    const service: ConditionsService = TestBed.inject(ConditionsService);
    expect(service).toBeTruthy();
  });
});
