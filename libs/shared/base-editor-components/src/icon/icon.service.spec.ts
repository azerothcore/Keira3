import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { IconService, TRADE_ENGINEERING_ICON_ID } from './icon.service';
import { instance, mock } from 'ts-mockito';
import { SqliteService } from '@keira/shared/db-layer';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { MysqlQueryService } from '@keira/shared/db-layer';

describe('IconService', () => {
  const mockArgument = '123';
  const mockResult = 'some result';
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SqliteService, useValue: instance(mock(SqliteService)) }],
    });
  });

  it('getIconByItemDisplayId() should correctly work', () => {
    const service = TestBed.inject(IconService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    spyOn(sqliteQueryService, 'getIconByItemDisplayId').and.returnValue(of(mockResult));

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

    spyOn(sqliteQueryService, 'getIconByItemDisplayId').and.returnValue(of(tgaIcon));

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
    spyOn(mysqlQueryService, 'getDisplayIdByItemId').and.returnValue(of(mockIntermediateResult));
    spyOn(service, 'getIconByItemDisplayId').and.returnValue(of(mockResult));

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
    spyOn(mysqlQueryService, 'getDisplayIdByItemId').and.returnValue(of(null));
    spyOn(service, 'getIconByItemDisplayId');

    service.getIconByItemId(mockArgument).subscribe((result) => {
      expect(result).toEqual(null);
    });
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledWith(mockArgument);
    expect(service.getIconByItemDisplayId).toHaveBeenCalledTimes(0);
  });

  it('getIconBySpellId() should correctly work [case sqliteQuery return non-null]', (done) => {
    const service = TestBed.inject(IconService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    const mockIntermediateResult = 'some result';
    spyOn(sqliteQueryService, 'getDisplayIdBySpellId').and.returnValue(of(mockIntermediateResult));
    spyOn(sqliteQueryService, 'getIconBySpellDisplayId').and.callFake((displayId) => of(String(displayId)));

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
    spyOn(sqliteQueryService, 'getDisplayIdBySpellId').and.returnValue(of(null));
    spyOn(sqliteQueryService, 'getIconBySpellDisplayId').and.callFake((displayId) => of(String(displayId)));

    service.getIconBySpellId(mockArgument).subscribe((result) => {
      expect(result).toEqual(String(TRADE_ENGINEERING_ICON_ID));
      done();
    });
    expect(sqliteQueryService.getDisplayIdBySpellId).toHaveBeenCalledTimes(1);
    expect(sqliteQueryService.getDisplayIdBySpellId).toHaveBeenCalledWith(mockArgument);
  });
});
