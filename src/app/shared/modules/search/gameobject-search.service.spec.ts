import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';

import { GameobjectSearchService } from './gameobject-search.service';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { MockedMysqlQueryService } from '../../testing/mocks';

describe('GameobjectSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: GameobjectSearchService = TestBed.inject(GameobjectSearchService);
    expect(service).toBeTruthy();
  });
});
