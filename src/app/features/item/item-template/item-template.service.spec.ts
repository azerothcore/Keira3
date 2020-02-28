import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { ItemTemplateService } from './item-template.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '@keira-testing/mocks';
import { ItemHandlerService } from '../item-handler.service';

describe('ItemTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      ItemHandlerService,
      ItemTemplateService,
    ]
  }));

  it('should be created', () => {
    const service: ItemTemplateService = TestBed.inject(ItemTemplateService);
    expect(service).toBeTruthy();
  });
});
