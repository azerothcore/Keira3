import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';

import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { MockedMysqlQueryService } from '../../../services/services.mock';
import { MockHandlerService, SelectMockService } from '../../../core.mock';
import { SaiHandlerService } from '@keira/shared/core';

describe('SelectService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        SelectMockService,
        MockHandlerService,
        SaiHandlerService,
      ],
    }),
  );

  it('onSelect() should correctly work', () => {
    const service = TestBed.inject(SelectMockService);
    const spy = spyOn(TestBed.inject(MockHandlerService), 'select');
    const selected = [{ [service['entityIdField']]: 'myId', [service['entityNameField']]: 'myName' }];

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(false, `${selected[0][service['entityIdField']]}`, `${selected[0][service['entityNameField']]}`);
  });

  it('onSelect() should use the table name when the entityNameField is not defined', () => {
    const service = TestBed.inject(SelectMockService);
    const spy = spyOn(TestBed.inject(MockHandlerService), 'select');
    const selected = [{ [service['entityIdField']]: 'myId', [service['entityNameField']]: 'myName' }];
    service['entityNameField'] = null;

    service.onSelect({ selected });

    expect(spy).toHaveBeenCalledWith(false, `${selected[0][service['entityIdField']]}`, service['entityTable']);
  });
});
