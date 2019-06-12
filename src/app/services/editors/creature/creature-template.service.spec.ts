import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { CreatureTemplateService } from './creature-template.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';

describe('CreatureTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: CreatureTemplateService = TestBed.get(CreatureTemplateService);
    expect(service).toBeTruthy();
  });
});
