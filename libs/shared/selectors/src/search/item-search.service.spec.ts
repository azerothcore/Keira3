import { TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { ItemSearchService } from './item-search.service';

describe('ItemSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: ItemSearchService = TestBed.inject(ItemSearchService);
    expect(service).toBeTruthy();
  });
});
