import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/core';
import { MockedMysqlQueryService, MockedToastrService } from '@keira/shared/test-utils';
import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { MailLootTemplateService } from './mail-loot-template.service';

describe('MailLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        MailLootHandlerService,
        MailLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(MailLootTemplateService)).toBeTruthy();
  });
});
