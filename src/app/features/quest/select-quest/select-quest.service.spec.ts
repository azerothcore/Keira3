import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectQuestService } from './select-quest.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { QuestHandlerService } from '../quest-handler.service';

describe('SelectQuestService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }, QuestHandlerService, SelectQuestService],
    }),
  );

  it('should be created', () => {
    const service: SelectQuestService = TestBed.inject(SelectQuestService);
    expect(service).toBeTruthy();
  });
});
