import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService, SqliteService, MockedSqliteService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';

describe('ItemEnchantmentTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
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
