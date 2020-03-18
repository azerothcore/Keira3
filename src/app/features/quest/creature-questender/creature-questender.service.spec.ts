import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { CreatureQuestenderService } from './creature-questender.service';
import { QuestHandlerService } from '../quest-handler.service';

describe('CreatureQuestenderService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      QuestHandlerService,
      CreatureQuestenderService,
    ]
  }));

  it('should be created', () => {
    const service: CreatureQuestenderService = TestBed.inject(CreatureQuestenderService);
    expect(service).toBeTruthy();
  });
});
