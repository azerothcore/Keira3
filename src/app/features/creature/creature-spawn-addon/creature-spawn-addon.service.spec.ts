import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { CreatureSpawnAddonService } from './creature-spawn-addon.service';
import { QueryService } from '../../../shared/services/query.service';
import { MockedQueryService, MockedToastrService } from '../../../shared/testing/mocks';

describe('CreatureSpawnAddonService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
    ],
    providers: [
      { provide: QueryService, useValue: instance(MockedQueryService) },
      { provide: ToastrService, useValue: instance(MockedToastrService) },
    ],
  }));

  it('selectQuery should correctly work', () => {
    const service: CreatureSpawnAddonService = TestBed.get(CreatureSpawnAddonService);
    const querySpy = spyOn(TestBed.get(QueryService), 'query');
    const id = 123;

    service.selectQuery(id);

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id = ${id}`
    );
  });
});
