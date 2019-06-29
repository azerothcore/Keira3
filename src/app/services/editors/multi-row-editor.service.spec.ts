import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { MultiRowEditorService } from './multi-row-editor.service';
import { SpawnsService } from './creature/spawns.service';
import { Spawns } from '../../types/spawns.type';


describe('MultiRowEditorService', () => {
  let service: MultiRowEditorService<Spawns>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(SpawnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO
});
