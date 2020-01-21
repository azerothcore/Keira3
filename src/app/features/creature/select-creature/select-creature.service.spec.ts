import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectCreatureService } from './select-creature.service';
import { QueryService } from '../../../shared/services/query.service';
import { MockedQueryService } from '../../../shared/testing/mocks';

describe('CreatureSelectService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: SelectCreatureService = TestBed.get(SelectCreatureService);
    expect(service).toBeTruthy();
  });
});
