import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectCreatureService } from './select-creature.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

describe('SelectCreatureService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      CreatureHandlerService,
      SaiCreatureHandlerService,
      SelectCreatureService,
    ],
  }));

  it('should be created', () => {
    const service: SelectCreatureService = TestBed.inject(SelectCreatureService);
    expect(service).toBeTruthy();
  });
});
