import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { ItemLootTemplateService } from './item-loot-template.service';
import { QueryService } from '../../shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';

describe('ItemLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
    ],
  }));

  it('should be created', () => {
    const service: ItemLootTemplateService = TestBed.get(ItemLootTemplateService);
    expect(service).toBeTruthy();
  });
});
