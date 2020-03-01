import { mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';

import { ElectronService } from '../services/electron.service';
import { MysqlService } from '../services/mysql.service';
import { MysqlQueryService } from '../services/mysql-query.service';
import { TableRow } from '../types/general';

export const MockedToastrService = mock(ToastrService);
export const MockedMysqlQueryService = mock(MysqlQueryService);
export const MockedMysqlService = mock(MysqlService);
export const MockedElectronService = mock(ElectronService);

// tslint:disable-next-line:no-empty-interface
export interface MockType extends TableRow {}
