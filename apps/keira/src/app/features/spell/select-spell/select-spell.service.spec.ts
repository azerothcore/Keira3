import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MysqlQueryService } from '@keira/shared/core';

import { instance } from 'ts-mockito';
import { SpellHandlerService } from '../spell-handler.service';
import { SelectSpellService } from './select-spell.service';

describe('SelectSpellService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }, SpellHandlerService, SelectSpellService],
    }),
  );

  it('should be created', () => {
    const service = TestBed.inject(SelectSpellService);
    expect(service).toBeTruthy();
  });
});
