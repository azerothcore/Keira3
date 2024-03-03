import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MockedMysqlQueryService } from '@keira/test-utils';
import { instance } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { SelectQuestService } from './select-quest.service';

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
