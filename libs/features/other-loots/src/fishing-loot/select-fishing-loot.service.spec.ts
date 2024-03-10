import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MysqlQueryService } from '@keira/shared/core';

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
