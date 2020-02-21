import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectCreatureService } from './select-creature.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService } from '@keira-testing/mocks';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

describe('SelectCreatureService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      CreatureHandlerService,
      SaiCreatureHandlerService,
      SelectCreatureService,
    ],
  }));

  it('should be created', () => {
    const service: SelectCreatureService = TestBed.inject(SelectCreatureService);
    expect(service).toBeTruthy();
  });
});
