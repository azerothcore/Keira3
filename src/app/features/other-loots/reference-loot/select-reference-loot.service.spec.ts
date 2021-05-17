import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectReferenceLootService } from './select-reference-loot.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

describe('SelectReferenceLootService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        SelectReferenceLootService,
        ReferenceLootHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectReferenceLootService)).toBeTruthy();
  });
});
