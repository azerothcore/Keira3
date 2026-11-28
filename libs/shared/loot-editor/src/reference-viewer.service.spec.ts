import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { TableRow } from '@keira/shared/constants';
import { ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { firstValueFrom, of } from 'rxjs';
import { ReferenceViewerService } from './reference-viewer.service';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';

describe('ReferenceViewerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  const setup = () => {
    const service = TestBed.inject(ReferenceViewerService);
    const queryService = TestBed.inject(MysqlQueryService);
    return { service, queryService };
  };

  it('should be created', async () => {
    const mockReferenceLoot: ReferenceLootTemplate[] = [new ReferenceLootTemplate()];
    const referenceId = 1234;
    const { service, queryService } = setup();
    const querySpy = vi.spyOn(queryService, 'query').mockImplementation(() => undefined);
    querySpy.mockReturnValue(of(mockReferenceLoot as TableRow[]));

    const result = await firstValueFrom(service.getReferenceById(referenceId));

    expect(result).toEqual(mockReferenceLoot);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM reference_loot_template WHERE Entry = ${referenceId}`);
  });
});
