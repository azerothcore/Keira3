import { mock } from 'ts-mockito';

import { ElectronService } from '../services/electron.service';
import { MysqlService } from '../services/mysql.service';
import { QueryService } from '../services/query.service';
import { TableRow } from '../types/general';

export const MockedQueryService = mock(QueryService);
export const MockedMysqlService = mock(MysqlService);
export const MockedElectronService = mock(ElectronService);

// tslint:disable-next-line:no-empty-interface
export interface MockType extends TableRow {}
