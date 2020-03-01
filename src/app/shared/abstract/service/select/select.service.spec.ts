import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { SelectCreatureService } from '../../../../features/creature/select-creature/select-creature.service';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { MockedMysqlQueryService } from '@keira-testing/mocks';
import { SelectService } from './select.service';
import { CreatureHandlerService } from '../../../../features/creature/creature-handler.service';
import { SaiCreatureHandlerService } from '../../../../features/creature/sai-creature-handler.service';

describe('SelectService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      SelectCreatureService,
      CreatureHandlerService,
      SaiCreatureHandlerService,
    ],
  }));

  it('onSelect() should correctly work', () => {
    const service = TestBed.inject(SelectCreatureService);
    const spy = spyOn(TestBed.inject(CreatureHandlerService), 'select');
    const selected = [{ [service['entityIdField']]: 'myId', [service['entityNameField']]: 'myName' }];

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(
      false,
      `${selected[0][service['entityIdField']]}`,
      `${selected[0][service['entityNameField']]}`,
    );
  });

  it('onSelect() should use the table name when the entityNameField is not defined', () => {
    const service = TestBed.inject(SelectCreatureService);
    const spy = spyOn(TestBed.inject(CreatureHandlerService), 'select');
    const selected = [{ [service['entityIdField']]: 'myId', [service['entityNameField']]: 'myName' }];
    service['entityNameField'] = null;

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(
      false,
      `${selected[0][service['entityIdField']]}`,
      service['entityTable'],
    );
  });
});
