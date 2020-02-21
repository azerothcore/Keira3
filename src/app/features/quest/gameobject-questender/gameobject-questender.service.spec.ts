import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { GameobjectQuestenderService } from './gameobject-questender.service';
import { QuestHandlerService } from '../quest-handler.service';

describe('GameobjectQuestenderService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      QuestHandlerService,
      GameobjectQuestenderService,
    ]
  }));

  it('should be created', () => {
    const service: GameobjectQuestenderService = TestBed.inject(GameobjectQuestenderService);
    expect(service).toBeTruthy();
  });
});
