import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';
import { ItemHandlerService } from '../item-handler.service';

describe('ItemEnchantmentTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        ItemHandlerService,
        ItemEnchantmentTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    const service: ItemEnchantmentTemplateService = TestBed.inject(ItemEnchantmentTemplateService);
    expect(service).toBeTruthy();
  });
});
