import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureText } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTextService } from './creature-text.service';

describe('CreatureTextService', () => {
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
        CreatureTextService,
      ],
    }),
  );

  it('should be created', () => {
    const service: CreatureTextService = TestBed.inject(CreatureTextService);
    expect(service).toBeTruthy();
  });

  describe('assignDuplicatedRowIds()', () => {
    const rowsOf = (pairs: [number, number][]) => pairs.map(([GroupID, ID]) => ({ ...new CreatureText(), CreatureID: 1234, GroupID, ID }));

    it('should keep the GroupID and take the next ID of that group', () => {
      const service: CreatureTextService = TestBed.inject(CreatureTextService);
      service['_newRows'] = rowsOf([
        [0, 0],
        [0, 1],
        [1, 0],
      ]);
      const newRow = { ...new CreatureText(), CreatureID: 1234, GroupID: 0, ID: 1 };

      service['assignDuplicatedRowIds'](newRow);

      expect(newRow.GroupID).toBe(0);
      expect(newRow.ID).toBe(2);
    });

    it('should ignore the IDs used by other groups', () => {
      const service: CreatureTextService = TestBed.inject(CreatureTextService);
      service['_newRows'] = rowsOf([
        [0, 7],
        [1, 0],
      ]);
      const newRow = { ...new CreatureText(), CreatureID: 1234, GroupID: 1, ID: 0 };

      service['assignDuplicatedRowIds'](newRow);

      expect(newRow.GroupID).toBe(1);
      expect(newRow.ID).toBe(1);
    });

    it('should start at 0 when the group holds no row yet', () => {
      const service: CreatureTextService = TestBed.inject(CreatureTextService);
      service['_newRows'] = rowsOf([[0, 3]]);
      const newRow = { ...new CreatureText(), CreatureID: 1234, GroupID: 5, ID: 3 };

      service['assignDuplicatedRowIds'](newRow);

      expect(newRow.ID).toBe(0);
    });
  });
});
