import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { CreatureTemplateAddonService } from './creature-template-addon.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';

describe('CreatureTemplateAddonService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: CreatureTemplateAddonService = TestBed.get(CreatureTemplateAddonService);
    expect(service).toBeTruthy();
  });
});
