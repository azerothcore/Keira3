import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { MillingLootTemplateService } from './milling-loot-template.service';
import { ItemHandlerService } from '../item-handler.service';

describe('MillingLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        ItemHandlerService,
        MillingLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    const service: MillingLootTemplateService = TestBed.inject(MillingLootTemplateService);
    expect(service).toBeTruthy();
  });
});
