import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MockedMysqlQueryService } from '@keira/test-utils';
import { instance } from 'ts-mockito';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { SelectFishingLootService } from './select-fishing-loot.service';

describe('SelectFishingLootService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        SelectFishingLootService,
        FishingLootHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectFishingLootService)).toBeTruthy();
  });
});
