import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/shared/test-utils';
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
