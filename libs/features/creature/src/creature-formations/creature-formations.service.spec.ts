import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureFormationsService } from './creature-formations.service';

describe('CreatureFormationsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        CreatureFormationsService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureFormationsService = TestBed.inject(CreatureFormationsService);
    expect(service).toBeTruthy();
  });

  it('selectQuery should load the formations of every spawn of the creature', () => {
    const service: CreatureFormationsService = TestBed.inject(CreatureFormationsService);
    const querySpy = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockImplementation(() => undefined);
    const id = 123;

    service.selectQuery(id);

    expect(querySpy).toHaveBeenCalledWith(
      'SELECT f.* FROM creature_formations AS f WHERE f.leaderGUID IN (' +
        'SELECT f2.leaderGUID FROM creature_formations AS f2 ' +
        `INNER JOIN creature AS c ON c.guid IN (f2.leaderGUID, f2.memberGUID) WHERE c.id = ${id}) ORDER BY f.leaderGUID, f.memberGUID`,
    );
  });
});
