import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { DisenchantLootTemplateService } from './disenchant-loot-template.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ItemHandlerService } from '../item-handler.service';

describe('DisenchantLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemHandlerService,
      DisenchantLootTemplateService,
    ]
  }));

  it('should be created', () => {
    const service: DisenchantLootTemplateService = TestBed.inject(DisenchantLootTemplateService);
    expect(service).toBeTruthy();
  });
});
