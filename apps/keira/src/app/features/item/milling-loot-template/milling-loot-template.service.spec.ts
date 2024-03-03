import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { MillingLootTemplateService } from './milling-loot-template.service';

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
