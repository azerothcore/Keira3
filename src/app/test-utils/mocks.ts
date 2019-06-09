import { mock, when } from 'ts-mockito';
import { ElectronService } from '../services/electron.service';
import { MysqlService } from '../services/mysql.service';
import { QueryService } from '../services/query.service';
import { TableRow } from '../types';

export const MockedMysqlService = mock(MysqlService);
export const MockedQueryService = mock(QueryService);
export const MockedElectronService = mock(ElectronService);
when(MockedElectronService.isElectron()).thenReturn(false);

// tslint:disable-next-line:no-empty-interface
export interface MockType extends TableRow {}
