import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { MailLootTemplateService } from './mail-loot-template.service';
import { MailLootHandlerService } from './mail-loot-handler.service';

describe('MailLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      MailLootHandlerService,
      MailLootTemplateService,
    ]
  }));

  it('should be created', () => {
    expect(TestBed.inject(MailLootTemplateService)).toBeTruthy();
  });
});
