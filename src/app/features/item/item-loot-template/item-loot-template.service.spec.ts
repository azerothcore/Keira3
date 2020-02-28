import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { ItemLootTemplateService } from './item-loot-template.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ItemHandlerService } from '../item-handler.service';

describe('ItemLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemHandlerService,
      ItemLootTemplateService,
    ]
  }));

  it('should be created', () => {
    const service: ItemLootTemplateService = TestBed.inject(ItemLootTemplateService);
    expect(service).toBeTruthy();
  });
});
