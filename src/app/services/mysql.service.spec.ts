import { TestBed } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';

import { MysqlService } from './mysql.service';
import { ElectronService } from './electron.service';
import { MockedElectronService } from '../test-utils/mocks';

describe('MysqlService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide : ElectronService, useValue: instance(MockedElectronService) },
    ]
  }));

  it('should be created', () => {
    const service: MysqlService = TestBed.get(MysqlService);
    expect(service).toBeTruthy();
  });

  afterEach(() => {
    reset(MockedElectronService);
  });
});
