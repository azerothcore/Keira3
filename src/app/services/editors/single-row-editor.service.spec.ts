import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { CreatureTemplateService } from './creature/creature-template.service';
import { SingleRowEditorService } from './single-row-editor.service';
import { CreatureTemplate } from '../../types/creature-template.type';


describe('SingleRowEditorService', () => {
  let service: SingleRowEditorService<CreatureTemplate>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(CreatureTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO
});
