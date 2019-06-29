import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { LootEditorService } from './loot-editor.service';
import { CreatureLootTemplate } from '../../types/creature-loot-template.type';
import { CreatureLootTemplateService } from './creature/creature-loot-template.service';


describe('LootEditorService', () => {
  let service: LootEditorService<CreatureLootTemplate>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(CreatureLootTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO
});
