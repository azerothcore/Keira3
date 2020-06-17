import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { SpellLootTemplateService } from './spell-loot-template.service';
import { SpellLootHandlerService } from './spell-loot-handler.service';

describe('SpellLootTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      SpellLootHandlerService,
      SpellLootTemplateService,
    ]
  }));

  it('should be created', () => {
    expect(TestBed.inject(SpellLootTemplateService)).toBeTruthy();
  });
});
