import { ElectronService, MysqlQueryService, MysqlService, SqliteQueryService, SqliteService } from '@keira/shared/core';
import { ToastrService } from 'ngx-toastr';
import { mock } from 'ts-mockito';

import { TableRow } from '@keira/shared/constants';
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
