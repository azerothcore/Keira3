import { TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { GameobjectSearchService } from './gameobject-search.service';

describe('GameobjectSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: GameobjectSearchService = TestBed.inject(GameobjectSearchService);
    expect(service).toBeTruthy();
  });
});
