import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { CreatureQueststarterService } from './creature-queststarter.service';

describe('CreatureQueststarterService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        QuestHandlerService,
        CreatureQueststarterService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureQueststarterService = TestBed.inject(CreatureQueststarterService);
    expect(service).toBeTruthy();
  });
});
