import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MysqlQueryService } from '@keira/shared/core';

import { instance } from 'ts-mockito';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { SelectMailLootService } from './select-mail-loot.service';

describe('SelectMailLootService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        SelectMailLootService,
        MailLootHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectMailLootService)).toBeTruthy();
  });
});
