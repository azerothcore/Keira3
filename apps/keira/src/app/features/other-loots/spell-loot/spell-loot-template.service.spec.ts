import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { SpellLootTemplateService } from './spell-loot-template.service';

describe('SpellLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        SpellLootHandlerService,
        SpellLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SpellLootTemplateService)).toBeTruthy();
  });
});
