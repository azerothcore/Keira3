import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { MultiRowExternalEditorService } from './multi-row-external-editor.service';
import { SpawnsAddon } from '../../types/spawns-addon.type';
import { SpawnsAddonService } from './creature/spawns-addon.service';


describe('MultiRowExternalEditorService', () => {
  let service: MultiRowExternalEditorService<SpawnsAddon>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(SpawnsAddonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO
});
