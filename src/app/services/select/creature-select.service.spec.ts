import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { CreatureSelectService } from './creature-select.service';
import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';

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
    const service: CreatureSelectService = TestBed.get(CreatureSelectService);
    expect(service).toBeTruthy();
  });
});
