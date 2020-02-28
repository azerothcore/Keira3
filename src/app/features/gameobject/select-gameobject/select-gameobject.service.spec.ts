import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectGameobjectService } from './select-gameobject.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService } from '@keira-testing/mocks';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

describe('SelectGameobjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      GameobjectHandlerService,
      SaiGameobjectHandlerService,
      SelectGameobjectService,
    ]
  }));

  it('should be created', () => {
    const service: SelectGameobjectService = TestBed.inject(SelectGameobjectService);
    expect(service).toBeTruthy();
  });
});
