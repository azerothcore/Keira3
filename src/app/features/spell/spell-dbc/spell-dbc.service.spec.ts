import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { SpellHandlerService } from '../spell-handler.service';
import { SpellDbcService } from './spell-dbc.service';

describe('SpellDbcService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        SpellHandlerService,
        SpellDbcService,
      ],
    }),
  );

  it('should be created', () => {
    const service = TestBed.inject(SpellDbcService);
    expect(service).toBeTruthy();
  });
});
