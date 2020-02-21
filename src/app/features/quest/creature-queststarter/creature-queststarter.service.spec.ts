import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { CreatureQueststarterService } from './creature-queststarter.service';
import { QuestHandlerService } from '../quest-handler.service';

describe('CreatureQueststarterService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      QuestHandlerService,
      CreatureQueststarterService,
    ]
  }));

  it('should be created', () => {
    const service: CreatureQueststarterService = TestBed.inject(CreatureQueststarterService);
    expect(service).toBeTruthy();
  });
});
