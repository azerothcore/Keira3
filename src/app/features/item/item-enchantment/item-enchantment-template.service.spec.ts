import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';
import { ItemHandlerService } from '../item-handler.service';

describe('ItemEnchantmentTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemHandlerService,
      ItemEnchantmentTemplateService,
    ]
  }));

  it('should be created', () => {
    const service: ItemEnchantmentTemplateService = TestBed.inject(ItemEnchantmentTemplateService);
    expect(service).toBeTruthy();
  });
});
