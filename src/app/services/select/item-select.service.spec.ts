import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { ItemSelectService } from './item-select.service';
import { QueryService } from '../query.service';
import { MockedQueryService } from '../../test-utils/mocks';

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
    const service: ItemSelectService = TestBed.get(ItemSelectService);
    expect(service).toBeTruthy();
  });
});
