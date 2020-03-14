import { TestBed } from '@angular/core/testing';

import { IconService } from './icon.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { of } from 'rxjs';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';

describe('IconService', () => {
  const mockArgument = '123';
  const mockResult = 'some result';
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('getIconByItemDisplayId() should correctly work', () => {
    const service = TestBed.inject(IconService);
    const sqliteQueryService = TestBed.inject(SqliteQueryService);
    spyOn(sqliteQueryService, 'getIconByItemDisplayId').and.returnValue(of(mockResult));

    service.getIconByItemDisplayId(mockArgument).subscribe(result => {
      expect(result).toEqual(mockResult);
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

    service.getIconByItemId(mockArgument).subscribe(result => {
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

    service.getIconByItemId(mockArgument).subscribe(result => {
      expect(result).toEqual(null);
    });
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledTimes(1);
    expect(mysqlQueryService.getDisplayIdByItemId).toHaveBeenCalledWith(mockArgument);
    expect(service.getIconByItemDisplayId).toHaveBeenCalledTimes(0);
  });
});
