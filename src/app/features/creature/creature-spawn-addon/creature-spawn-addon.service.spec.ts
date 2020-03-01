import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { CreatureSpawnAddonService } from './creature-spawn-addon.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { MockedMysqlQueryService, MockedToastrService } from '@keira-testing/mocks';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

describe('CreatureSpawnAddonService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
      CreatureHandlerService,
      SaiCreatureHandlerService,
      CreatureSpawnAddonService,
    ],
  }));

  it('selectQuery should correctly work', () => {
    const service: CreatureSpawnAddonService = TestBed.inject(CreatureSpawnAddonService);
    const querySpy = spyOn(TestBed.inject(MysqlQueryService), 'query');
    const id = 123;

    service.selectQuery(id);

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id = ${id}`
    );
  });
});
