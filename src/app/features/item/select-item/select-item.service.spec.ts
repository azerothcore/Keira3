import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { instance } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { SelectItemService } from './select-item.service';

describe('SelectItemService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }, ItemHandlerService, SelectItemService],
    }),
  );

  it('should be created', () => {
    const service: SelectItemService = TestBed.inject(SelectItemService);
    expect(service).toBeTruthy();
  });
});
