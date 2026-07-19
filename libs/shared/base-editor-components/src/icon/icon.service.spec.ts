import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { of } from 'rxjs';
import { IconService, TRADE_ENGINEERING_ICON_ID } from './icon.service';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService, SqliteQueryService, SqliteService } from '@keira/shared/db-layer';

describe('IconService', () => {
  const mockArgument = '123';
  const mockResult = 'some result';
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    });
  });

  it('getIconByItemDisplayId() should correctly work', () => {
    const service = TestBed.inject(IconService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    vi.spyOn(sqliteQueryService, 'getIconByItemDisplayId').mockReturnValue(of(mockResult));

    service.getIconByItemDisplayId(mockArgument).subscribe((result) => {
      expect(result).toEqual(mockResult);
    });
    expect(sqliteQueryService.getIconByItemDisplayId).toHaveBeenCalledTimes(1);
    expect(sqliteQueryService.getIconByItemDisplayId).toHaveBeenCalledWith(mockArgument);
  });

  it('getIconByItemDisplayId() should remove .tga from icon name', () => {
    const service = TestBed.inject(IconService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);

    const tgaIcon = 'icon.tga';
    const icon = 'icon';

    vi.spyOn(sqliteQueryService, 'getIconByItemDisplayId').mockReturnValue(of(tgaIcon));

    service.getIconByItemDisplayId(mockArgument).subscribe((result) => {
      expect(result).toEqual(icon);
    });
    expect(sqliteQueryService.getIconByItemDisplayId).toHaveBeenCalledTimes(1);
    expect(sqliteQueryService.getIconByItemDisplayId).toHaveBeenCalledWith(mockArgument);
  });

  it('getIconByItemId() should correctly work [case mysqlQuery return non-null]', () => {
    const service = TestBed.inject(IconService);
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    const mockIntermediateResult = 'some intermediate result';
    vi.spyOn(mysqlQueryService, 'getDisplayIdByItemId').mockReturnValue(of(mockIntermediateResult));
    vi.spyOn(service, 'getIconByItemDisplayId').mockReturnValue(of(mockResult));

    service.getIconByItemId(mockArgument).subscribe((result) => {
      expect(result).toEqual(mockResult);
    });
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledWith(mockArgument);
    expect(service.getIconByItemDisplayId).toHaveBeenCalledTimes(1);
    expect(service.getIconByItemDisplayId).toHaveBeenCalledWith(mockIntermediateResult);
  });

  it('getIconByItemId() should correctly work [case mysqlQuery return null]', () => {
    const service = TestBed.inject(IconService);
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(mysqlQueryService, 'getDisplayIdByItemId').mockReturnValue(of(undefined));
    vi.spyOn(service, 'getIconByItemDisplayId').mockImplementation(() => undefined);

    service.getIconByItemId(mockArgument).subscribe((result) => {
      expect(result).toEqual(null as any);
    });
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledWith(mockArgument);
    expect(service.getIconByItemDisplayId).toHaveBeenCalledTimes(0);
  });

  it('getIconBySpellId() should correctly work [case sqliteQuery return non-null]', (done) => {
    const service = TestBed.inject(IconService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const mockIntermediateResult = 'some result';
    vi.spyOn(sqliteQueryService, 'getDisplayIdBySpellId').mockReturnValue(of(mockIntermediateResult));
    vi.spyOn(sqliteQueryService, 'getIconBySpellDisplayId').mockImplementation((displayId) => of(String(displayId)));

    service.getIconBySpellId(mockArgument).subscribe((result) => {
      expect(result).toEqual(mockResult);
      done();
    });
    expect(sqliteQueryService.getDisplayIdBySpellId).toHaveBeenCalledTimes(1);
    expect(sqliteQueryService.getDisplayIdBySpellId).toHaveBeenCalledWith(mockArgument);
  });

  it('getIconBySpellId() should correctly work [case sqliteQuery return null]', (done) => {
    const service = TestBed.inject(IconService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    vi.spyOn(sqliteQueryService, 'getDisplayIdBySpellId').mockReturnValue(of(undefined));
    vi.spyOn(sqliteQueryService, 'getIconBySpellDisplayId').mockImplementation((displayId) => of(String(displayId)));

    service.getIconBySpellId(mockArgument).subscribe((result) => {
      expect(result).toEqual(String(TRADE_ENGINEERING_ICON_ID));
      done();
    });
    expect(sqliteQueryService.getDisplayIdBySpellId).toHaveBeenCalledTimes(1);
    expect(sqliteQueryService.getDisplayIdBySpellId).toHaveBeenCalledWith(mockArgument);
  });
});
