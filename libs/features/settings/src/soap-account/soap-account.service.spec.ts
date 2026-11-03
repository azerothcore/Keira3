import { TestBed } from '@angular/core/testing';
import { ServerSettingsService } from '@keira/shared/common-services';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { of } from 'rxjs';
import { accountProblem, generateAccountName, generatePassword, SoapAccountService } from './soap-account.service';

describe('SoapAccountService', () => {
  const setup = (taken: unknown[] | undefined = []) => {
    localStorage.clear();
    const query = vi.fn((sql: string) => of(sql.startsWith('SELECT') ? taken : []));
    TestBed.configureTestingModule({ providers: [{ provide: MysqlQueryService, useValue: { query } }] });
    return { service: TestBed.inject(SoapAccountService), query, server: TestBed.inject(ServerSettingsService) };
  };

  it('makes names and passwords the core accepts, and says what is wrong with others', () => {
    expect(generateAccountName()).toMatch(/^Keira\d{7}$/);
    expect(generatePassword()).toMatch(/^[A-Za-z0-9]{16}$/);
    expect(accountProblem('Keira1234567', 'pass')).toBe('');
    expect(accountProblem('Keira 1', 'pass')).toContain('letters or digits');
    expect(accountProblem('a'.repeat(18), 'pass')).toContain('17');
    expect(accountProblem('a', '')).toContain('16');
    expect(accountProblem('a', 'p'.repeat(17))).toContain('16');
  });

  it('writes the SQL making the account, its GM level 3 everywhere and its realm rows', async () => {
    const { service } = setup();
    const sql = (await service.sql('Keira1234567', 'secret')).split('\n');
    expect(sql[0]).toMatch(
      /^INSERT INTO `acore_auth`\.`account` \(`username`, `salt`, `verifier`, `expansion`, `reg_mail`, `email`, `joindate`\) VALUES \('KEIRA1234567', X'[0-9a-f]{64}', X'[0-9a-f]{64}', 2, '', '', NOW\(\)\);$/,
    );
    expect(sql[1]).toBe(
      "INSERT INTO `acore_auth`.`account_access` (`id`, `gmlevel`, `RealmID`) SELECT `id`, 3, -1 FROM `acore_auth`.`account` WHERE `username` = 'KEIRA1234567';",
    );
    expect(sql[2]).toContain('`acore_auth`.`realmcharacters`');
    await expect(service.sql('bad name', 'x')).rejects.toThrow('letters or digits');
  });

  it('makes the account and keeps it as the SOAP login, refusing a name taken or a bad database', async () => {
    const { service, query, server } = setup();
    await service.create('Keira1234567', 'secret');
    expect(query).toHaveBeenCalledTimes(4);
    expect(server.settings()).toEqual(expect.objectContaining({ soapUser: 'Keira1234567', soapPassword: 'secret' }));
    TestBed.resetTestingModule();
    const taken = setup([{ id: 5 }]);
    await expect(taken.service.create('Keira1234567', 'secret')).rejects.toThrow('already exists');
    TestBed.resetTestingModule();
    const unread = setup(undefined);
    await unread.service.create('Keira1', 'secret');
    unread.server.save({ authDatabase: 'x`; DROP' });
    await expect(unread.service.sql('Keira1', 'secret')).rejects.toThrow('not a database name');
  });
});
