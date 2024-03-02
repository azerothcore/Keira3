import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { SqliteService } from '@keira-shared/services/sqlite.service';
import { ToastrService } from 'ngx-toastr';
import { mock } from 'ts-mockito';
import { ElectronService } from '../services/electron.service';
import { MysqlQueryService } from '../services/query/mysql-query.service';
import { MysqlService } from '../services/mysql.service';
import { TableRow } from '@keira/acore-world-model';
import { ChangeDetectorRef } from '@angular/core';

export const MockedToastrService = mock(ToastrService);
export const MockedMysqlQueryService = mock(MysqlQueryService);
export const MockedSqliteQueryService = mock(SqliteQueryService);
export const MockedSqliteService = mock(SqliteService);
export const MockedMysqlService = mock(MysqlService);
export const MockedElectronService = mock(ElectronService);
export const mockChangeDetectorRef = { markForCheck: jasmine.createSpy() } as unknown as ChangeDetectorRef;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MockType extends TableRow {}
