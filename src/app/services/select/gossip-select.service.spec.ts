import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { GossipSelectService } from './gossip-select.service';
import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';

describe('GossipSelectService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: GossipSelectService = TestBed.get(GossipSelectService);
    expect(service).toBeTruthy();
  });
});
