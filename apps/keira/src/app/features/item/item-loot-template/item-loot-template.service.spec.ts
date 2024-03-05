import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/shared/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { ItemLootTemplateService } from './item-loot-template.service';

describe('ItemLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        ItemHandlerService,
        ItemLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    const service: ItemLootTemplateService = TestBed.inject(ItemLootTemplateService);
    expect(service).toBeTruthy();
  });
});
