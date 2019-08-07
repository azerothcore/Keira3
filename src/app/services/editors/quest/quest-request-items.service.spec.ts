import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';
import { QuestRequestItemsService } from './quest-request-items.service';

describe('QuestRequestItemsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: QuestRequestItemsService = TestBed.get(QuestRequestItemsService);
    expect(service).toBeTruthy();
  });
});
