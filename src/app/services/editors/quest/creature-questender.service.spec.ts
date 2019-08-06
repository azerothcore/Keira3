import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';
import { CreatureQuestenderService } from './creature-questender.service';

describe('CreatureQuestenderService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: CreatureQuestenderService = TestBed.get(CreatureQuestenderService);
    expect(service).toBeTruthy();
  });
});
