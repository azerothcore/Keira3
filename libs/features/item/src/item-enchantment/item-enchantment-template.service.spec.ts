import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';

describe('ItemEnchantmentTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
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
