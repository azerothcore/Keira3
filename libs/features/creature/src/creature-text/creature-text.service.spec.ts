import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BroadcastText, CreatureText } from '@keira/shared/acore-world-model';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { BroadcastTextRow } from './broadcast-text-browser/broadcast-text-browser.model';
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

  describe('applyBroadcastText()', () => {
    const broadcastText = { ...new BroadcastText(), ID: 25, LanguageID: 7, MaleText: 'hello', Text: 'hello' } as BroadcastTextRow;

    function setupWithSelectedRow() {
      const service: CreatureTextService = TestBed.inject(CreatureTextService);
      const row = { ...new CreatureText(), CreatureID: 1234, GroupID: 0, ID: 0 };
      service['_newRows'] = [row];
      service.onRowSelection({ selected: [row] });

      return service;
    }

    it('should fill the selected row with the id, the language and the text at once', () => {
      const service = setupWithSelectedRow();

      service.applyBroadcastText(broadcastText);

      expect(service.newRows[0]).toEqual(expect.objectContaining({ BroadcastTextId: 25, Language: 7, Text: 'hello' }));
    });

    it('should leave the rest of the row alone', () => {
      const service = setupWithSelectedRow();

      service.applyBroadcastText(broadcastText);

      expect(service.newRows[0]).toEqual(expect.objectContaining({ CreatureID: 1234, GroupID: 0, ID: 0, Type: 12, Probability: 100 }));
    });

    it('should do nothing when no row is selected', () => {
      const service: CreatureTextService = TestBed.inject(CreatureTextService);

      service.applyBroadcastText(broadcastText);

      expect(service.form.controls['BroadcastTextId'].value).toBeNull();
    });
  });
});
