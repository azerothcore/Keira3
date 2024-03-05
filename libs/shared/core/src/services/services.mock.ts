import { ToastrService } from 'ngx-toastr';
import { mock } from 'ts-mockito';

import { TableRow } from '@keira/shared/constants';
import { ChangeDetectorRef } from '@angular/core';

import { ElectronService } from './electron.service';
import { MysqlQueryService } from './query/mysql-query.service';
import { MysqlService } from './mysql.service';
import { SqliteQueryService } from './query/sqlite-query.service';
import { SqliteService } from './sqlite.service';

export const MockedToastrService = mock(ToastrService);
export const MockedMysqlQueryService = mock(MysqlQueryService);
export const MockedSqliteQueryService = mock(SqliteQueryService);
export const MockedSqliteService = mock(SqliteService);
export const MockedMysqlService = mock(MysqlService);
export const MockedElectronService = mock(ElectronService);
// @ts-ignore
export const mockChangeDetectorRef = { markForCheck: jasmine.createSpy() } as unknown as ChangeDetectorRef;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MockType extends TableRow {}
