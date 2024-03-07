import { TestBed } from '@angular/core/testing';
import { SqliteService } from './sqlite.service';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

describe('SqliteService', () => {
  let service: SqliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    });
    service = TestBed.inject(SqliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
