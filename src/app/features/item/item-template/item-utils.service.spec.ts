import { TestBed } from '@angular/core/testing';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { instance } from 'ts-mockito';
import { ItemUtilsService } from './item-utils.service';

describe('ItemUtilsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
    ]
  }));

  it('should be created', () => {
    const service: ItemUtilsService = TestBed.inject(ItemUtilsService);
    expect(service).toBeTruthy();
  });
});
