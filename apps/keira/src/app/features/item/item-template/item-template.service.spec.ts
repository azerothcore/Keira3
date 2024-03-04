import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { ItemTemplateService } from './item-template.service';

describe('ItemTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        ItemHandlerService,
        ItemTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    const service: ItemTemplateService = TestBed.inject(ItemTemplateService);
    expect(service).toBeTruthy();
  });
});
