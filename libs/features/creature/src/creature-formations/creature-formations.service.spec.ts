import { of } from 'rxjs';
import { CreatureFormation } from '@keira/shared/acore-world-model';
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

describe('CreatureSpawnService', () => {
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

  it('reads no spawns when the database gives none, and starts a row in no formation without a leader', () => {
    const service = TestBed.inject(CreatureFormationsService);
    vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of(undefined) as never);
    let spawns: unknown;
    service.getSpawns(1).subscribe((rows) => (spawns = rows));
    expect(spawns).toEqual([]);
    const row = new CreatureFormation();
    row.leaderGUID = 5;
    service['addIdToNewRow'](row);
    expect(row.leaderGUID).toBe(0);
  });
});
