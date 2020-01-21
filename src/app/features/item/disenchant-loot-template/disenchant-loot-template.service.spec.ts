import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { DisenchantLootTemplateService } from './disenchant-loot-template.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ItemHandlerService } from '../item-handler.service';

describe('DisenchantLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemHandlerService,
      DisenchantLootTemplateService,
    ]
  }));

  it('should be created', () => {
    const service: DisenchantLootTemplateService = TestBed.get(DisenchantLootTemplateService);
    expect(service).toBeTruthy();
  });
});
