import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';

describe('ProspectingLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: ProspectingLootTemplateService = TestBed.get(ProspectingLootTemplateService);
    expect(service).toBeTruthy();
  });
});
