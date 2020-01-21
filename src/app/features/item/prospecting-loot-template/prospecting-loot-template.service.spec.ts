import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';
import { ItemHandlerService } from '../item-handler.service';

describe('ProspectingLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemHandlerService,
      ProspectingLootTemplateService,
    ]
  }));

  it('should be created', () => {
    const service: ProspectingLootTemplateService = TestBed.get(ProspectingLootTemplateService);
    expect(service).toBeTruthy();
  });
});
