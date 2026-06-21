import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SqlEditorService } from './sql-editor.service';

describe('SqlEditorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), SqlEditorService],
    });
  });

  function setup() {
    const service = TestBed.inject(SqlEditorService);
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    return { service, mysqlQueryService };
  }

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
    expect(service.code).toBeTruthy();
  });

  describe('loadSchema()', () => {
    it('should build the schema from the available tables and columns', () => {
      const { service, mysqlQueryService } = setup();
      vi.spyOn(mysqlQueryService, 'getTables').mockReturnValue(of([{ Tables_in_acore_world: 'creature_template' }]));
      vi.spyOn(mysqlQueryService, 'getColumns').mockReturnValue(of([{ Field: 'entry' }, { Field: 'name' }, { Field: '' }]));

      service.loadSchema();

      expect(service.schema()).toEqual({ creature_template: ['entry', 'name'] });
      expect(service.schemaLoading()).toBe(false);
    });

    it('should set an empty schema when there are no tables', () => {
      const { service, mysqlQueryService } = setup();
      vi.spyOn(mysqlQueryService, 'getTables').mockReturnValue(of([]));
      const getColumnsSpy = vi.spyOn(mysqlQueryService, 'getColumns');

      service.loadSchema();

      expect(service.schema()).toEqual({});
      expect(service.schemaLoading()).toBe(false);
      expect(getColumnsSpy).not.toHaveBeenCalled();
    });
  });
});
