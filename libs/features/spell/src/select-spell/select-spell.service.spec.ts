import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { instance, mock } from 'ts-mockito';
import { SpellHandlerService } from '../spell-handler.service';
import { SelectSpellService } from './select-spell.service';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('SelectSpellService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }, SpellHandlerService, SelectSpellService],
    }),
  );

  it('should be created', () => {
    const service = TestBed.inject(SelectSpellService);
    expect(service).toBeTruthy();
  });
});
