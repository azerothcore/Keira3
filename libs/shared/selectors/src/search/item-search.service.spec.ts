import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/core';

import { ItemSearchService } from './item-search.service';
import { MockedMysqlQueryService } from '../../services/services.mock';

describe('ItemSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: ItemSearchService = TestBed.inject(ItemSearchService);
    expect(service).toBeTruthy();
  });
});
