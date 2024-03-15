import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { SelectSpellLootService } from './select-spell-loot.service';
import { SpellLootHandlerService } from './spell-loot-handler.service';

describe('SelectSpellLootService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectSpellLootService,
        SpellLootHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectSpellLootService)).toBeTruthy();
  });
});
