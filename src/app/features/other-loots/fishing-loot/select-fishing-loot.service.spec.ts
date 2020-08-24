import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectFishingLootService } from './select-fishing-loot.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

describe('SelectFishingLootService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      SelectFishingLootService,
      FishingLootHandlerService,
    ],
  }));

  it('should be created', () => {
    expect(TestBed.inject(SelectFishingLootService)).toBeTruthy();
  });
});
