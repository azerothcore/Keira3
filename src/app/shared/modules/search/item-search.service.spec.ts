import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { ItemSearchService } from './item-search.service';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { MockedMysqlQueryService } from '../../testing/mocks';

describe('ItemSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
    ]
  }));

  it('should be created', () => {
    const service: ItemSearchService = TestBed.inject(ItemSearchService);
    expect(service).toBeTruthy();
  });
});
