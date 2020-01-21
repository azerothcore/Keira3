import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectQuestService } from './select-quest.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService } from '@keira-testing/mocks';
import { QuestHandlerService } from '../quest-handler.service';

describe('SelectQuestService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      QuestHandlerService,
      SelectQuestService,
    ]
  }));

  it('should be created', () => {
    const service: SelectQuestService = TestBed.get(SelectQuestService);
    expect(service).toBeTruthy();
  });
});
