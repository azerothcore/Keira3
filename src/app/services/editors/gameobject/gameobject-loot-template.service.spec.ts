import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import { QueryService } from '../../query.service';
import { MockedQueryService } from '../../../test-utils/mocks';

describe('GameobjectLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: GameobjectLootTemplateService = TestBed.get(GameobjectLootTemplateService);
    expect(service).toBeTruthy();
  });
});
