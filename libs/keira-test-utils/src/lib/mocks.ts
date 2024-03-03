import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { SqliteService } from '@keira-shared/services/sqlite.service';
import { ToastrService } from 'ngx-toastr';
import { mock } from 'ts-mockito';

import { TableRow } from '@keira/shared-constants';
import { ChangeDetectorRef } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MysqlService } from '@keira-shared/services/mysql.service';
import { ElectronService } from '@keira-shared/services/electron.service';

export const MockedToastrService = mock(ToastrService);
export const MockedMysqlQueryService = mock(MysqlQueryService);
export const MockedSqliteQueryService = mock(SqliteQueryService);
export const MockedSqliteService = mock(SqliteService);
export const MockedMysqlService = mock(MysqlService);
export const MockedElectronService = mock(ElectronService);
export const mockChangeDetectorRef = { markForCheck: jasmine.createSpy() } as unknown as ChangeDetectorRef;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MockType extends TableRow {}
