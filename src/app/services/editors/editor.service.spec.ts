import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';
import { MockEditorService, MockEntity } from '../../test-utils/mock-services';
import { EditorService } from './editor.service';

describe('EditorService', () => {
  let service: EditorService<MockEntity>;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(MockEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
