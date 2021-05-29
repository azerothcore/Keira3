import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';
import { RouterTestingModule } from '@angular/router/testing';

import { SelectSpellService } from './select-spell.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { SpellHandlerService } from '../spell-handler.service';

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
