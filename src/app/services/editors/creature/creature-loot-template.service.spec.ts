import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { CreatureLootTemplateService } from './creature-loot-template.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';

describe('CreatureLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: CreatureLootTemplateService = TestBed.get(CreatureLootTemplateService);
    expect(service).toBeTruthy();
  });
});
