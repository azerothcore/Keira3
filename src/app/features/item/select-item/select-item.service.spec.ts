import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectItemService } from './select-item.service';
import { QueryService } from '../../../shared/services/query.service';
import { MockedQueryService } from '../../../shared/testing/mocks';

describe('ItemSelectService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
    ],
  }));

  it('should be created', () => {
    const service: SelectItemService = TestBed.get(SelectItemService);
    expect(service).toBeTruthy();
  });
});
