import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectSpellLootService } from './select-spell-loot.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { SpellLootHandlerService } from './spell-loot-handler.service';

describe('SelectSpellLootService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      SelectSpellLootService,
      SpellLootHandlerService,
    ],
  }));

  it('should be created', () => {
    expect(TestBed.inject(SelectSpellLootService)).toBeTruthy();
  });
});
