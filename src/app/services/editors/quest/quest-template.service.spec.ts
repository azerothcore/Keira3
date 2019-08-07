import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QuestTemplateService } from './quest-template.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';

describe('QuestTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: QuestTemplateService = TestBed.get(QuestTemplateService);
    expect(service).toBeTruthy();
  });
});
