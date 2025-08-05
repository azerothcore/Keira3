import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';

describe('CreatureSpawnAddonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureSpawnAddonService,
      ],
    }),
  );

  it('selectQuery should correctly work', () => {
    const service: CreatureSpawnAddonService = TestBed.inject(CreatureSpawnAddonService);
    const querySpy = spyOn(TestBed.inject(MysqlQueryService), 'query');
    const id = 123;

    service.selectQuery(id);

    expect(querySpy).toHaveBeenCalledWith(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id1 = ${id}`,
    );
  });
});
