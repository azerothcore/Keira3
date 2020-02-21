import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectItemService } from './select-item.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService } from '@keira-testing/mocks';
import { ItemHandlerService } from '../item-handler.service';

describe('SelectItemService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      ItemHandlerService,
      SelectItemService,
    ]
  }));

  it('should be created', () => {
    const service: SelectItemService = TestBed.inject(SelectItemService);
    expect(service).toBeTruthy();
  });
});
