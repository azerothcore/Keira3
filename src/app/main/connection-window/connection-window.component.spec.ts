import { TestBed, waitForAsync } from '@angular/core/testing';
import { MockedMysqlService } from '@keira-testing/mocks';
import { PageObject } from '@keira-testing/page-object';
import { Spied } from '@keira-testing/test-helpers';
import { ConnectionConfig, MysqlError } from 'mysql';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { of, throwError } from 'rxjs';
import { instance, reset } from 'ts-mockito';
import { MysqlService } from '../../shared/services/mysql.service';
import { ConnectionWindowComponent } from './connection-window.component';
import { ConnectionWindowModule } from './connection-window.module';
import { ConnectionWindowService } from './connection-window.service';

class ConnectionWindowComponentPage extends PageObject<ConnectionWindowComponent> {
  get hostInput() {
    return this.query<HTMLInputElement>('#host');
  }
  get portInput() {
    return this.query<HTMLInputElement>('#port');
  }
  get userInput() {
    return this.query<HTMLInputElement>('#user');
  }
  get passwordInput() {
    return this.query<HTMLInputElement>('#password');
  }
  get databaseInput() {
    return this.query<HTMLInputElement>('#database');
  }
  get connectBtn() {
    return this.query<HTMLButtonElement>('.connect-button');
  }
  get errorElement() {
    return this.query<HTMLButtonElement>('keira-query-error');
  }
  get savePasswordInput() {
    return this.query<HTMLInputElement>('#save-password');
  }
  get loadRecentBtn() {
    return this.query<HTMLButtonElement>('#load-recent button');
  }
  get clearAll() {
    return this.query<HTMLUListElement>('#clear-all');
  }
  get recentConfigs() {
    return this.queryAll<HTMLUListElement>('.config-item');
  }
}

describe('ConnectionWindowComponent', () => {
  const mockConfigsWithPass: Partial<ConnectionConfig>[] = [
    {
      host: 'localhost',
      port: 3306,
      user: 'Shin',
      password: 'shin123',
      database: 'shin_world',
    },
    {
      host: '127.0.0.1',
      port: 3306,
      user: 'Helias',
      password: 'helias123',
      database: 'helias_world',
    },
  ];
  const mockConfigsNoPass: Partial<ConnectionConfig>[] = [
    {
      host: 'localhost',
      port: 3306,
      user: 'Shin',
      password: 'shin123',
      database: 'shin_world',
    },
    {
      host: '127.0.0.1',
      port: 3306,
      user: 'Helias',
      password: '',
      database: 'helias_world',
    },
  ];

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TooltipModule.forRoot(), ConnectionWindowModule],
        providers: [
          { provide: MysqlService, useValue: instance(MockedMysqlService) },
          {
            provide: ConnectionWindowService,
            useValue: jasmine.createSpyObj('ConnectionWindowService', ['getConfigs', 'removeAllConfigs', 'saveNewConfig']),
          },
        ],
      }).compileComponents();
    }),
  );

  const setup = (detectChanges = true) => {
    const connectSpy = spyOn(TestBed.inject(MysqlService), 'connect').and.returnValue(of({}));
    const connectionWindowService = TestBed.inject(ConnectionWindowService) as unknown as Spied<ConnectionWindowService>;

    const fixture = TestBed.createComponent(ConnectionWindowComponent);
    const page = new ConnectionWindowComponentPage(fixture);
    const component = fixture.componentInstance;

    if (detectChanges) {
      fixture.detectChanges();
      fixture.autoDetectChanges(true);
    }

    return { fixture, page, component, connectSpy, connectionWindowService };
  };

  it('clicking on the connect button without altering the default values should correctly work', () => {
    const { page, component, connectSpy } = setup();
    component.error = { code: 'some previous error', errno: 1234 } as MysqlError;

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'acore_world',
    });
    expect(component.error).toBeNull();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  });

  it('the latest config should be loaded by default (if any)', () => {
    const { fixture, page, component, connectSpy, connectionWindowService } = setup(false);
    connectionWindowService.getConfigs.and.returnValue(mockConfigsWithPass);
    component.error = { code: 'some previous error', errno: 1234 } as MysqlError;
    fixture.detectChanges();

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 3306,
      user: 'Helias',
      password: 'helias123',
      database: 'helias_world',
    });

    expect(component.error).toBeNull();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  });

  it('filling the form and clicking on the connect button should correctly work', () => {
    const { page, component, connectSpy } = setup();
    const host = '192.168.1.100';
    const port = 9000;
    const user = 'shin';
    const password = 'helias';
    const database = 'my_world';
    component.error = { code: 'some previous error', errno: 1234 } as MysqlError;

    page.setInputValue(page.hostInput, host);
    page.setInputValue(page.portInput, port);
    page.setInputValue(page.userInput, user);
    page.setInputValue(page.passwordInput, password);
    page.setInputValue(page.databaseInput, database);
    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({ host, port, user, password, database });
    expect(component.error).toBeNull();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  });

  it('should correctly react on mysql connection error', () => {
    const { page, component, connectSpy } = setup();
    const error = {
      code: 'some error happened',
      errno: 1000,
      sqlMessage: 'some SQL error message',
      sqlState: 'some SQL state',
    } as MysqlError;
    connectSpy.and.returnValue(throwError(error));

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(component.error).toEqual(error);
    expect(page.errorElement.innerHTML).toContain('error-box');
    expect(page.errorElement.innerHTML).toContain(error.code);
    expect(page.errorElement.innerHTML).toContain(error.sqlMessage);
    expect(page.errorElement.innerHTML).toContain(error.sqlState);
    expect(page.errorElement.innerHTML).toContain(`${error.errno}`);
  });

  describe('the save checkbox', () => {
    it(
      'should be checked by default when there is no config',
      waitForAsync(async () => {
        const { page, connectionWindowService } = setup(false);
        connectionWindowService.getConfigs.and.returnValue(null);

        page.detectChanges();
        await page.whenStable();

        expect(page.savePasswordInput.checked).toBe(true);
      }),
    );

    it(
      'should be checked by default when the last used config has a non-empty password',
      waitForAsync(async () => {
        const { page, connectionWindowService } = setup(false);
        connectionWindowService.getConfigs.and.returnValue(mockConfigsWithPass);

        page.detectChanges();
        await page.whenStable();

        expect(page.savePasswordInput.checked).toBe(true);
      }),
    );

    it(
      'should be unchecked by default when the last used config has an empty password',
      waitForAsync(async () => {
        const { page, connectionWindowService } = setup(false);
        connectionWindowService.getConfigs.and.returnValue(mockConfigsNoPass);

        page.detectChanges();
        await page.whenStable();

        expect(page.savePasswordInput.checked).toBe(false);
      }),
    );

    it(
      'when selected, the password should be saved',
      waitForAsync(async () => {
        const password = 'opensource';
        const { page, connectionWindowService, connectSpy } = setup(false);
        connectionWindowService.getConfigs.and.returnValue(mockConfigsNoPass); // initially unselected, password empty
        page.detectChanges();
        await page.whenStable();

        page.setInputValue(page.passwordInput, password); // test toggle
        page.clickElement(page.savePasswordInput); // test toggle
        page.clickElement(page.connectBtn);

        expect(connectionWindowService.saveNewConfig).toHaveBeenCalledTimes(1);
        expect(connectionWindowService.saveNewConfig).toHaveBeenCalledWith({
          host: '127.0.0.1',
          port: 3306,
          user: 'Helias',
          password,
          database: 'helias_world',
        });
        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(connectSpy).toHaveBeenCalledWith({
          host: '127.0.0.1',
          port: 3306,
          user: 'Helias',
          password,
          database: 'helias_world',
        });
      }),
    );

    it(
      'when unselected, the password should NOT be saved',
      waitForAsync(async () => {
        const { page, connectionWindowService, connectSpy } = setup(false);
        connectionWindowService.getConfigs.and.returnValue(mockConfigsWithPass); // initially selected, password filled
        page.detectChanges();
        await page.whenStable();

        page.clickElement(page.savePasswordInput); // test toggle
        page.clickElement(page.connectBtn);

        expect(connectionWindowService.saveNewConfig).toHaveBeenCalledTimes(1);
        expect(connectionWindowService.saveNewConfig).toHaveBeenCalledWith({
          host: '127.0.0.1',
          port: 3306,
          user: 'Helias',
          password: '',
          database: 'helias_world',
        });
        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(connectSpy).toHaveBeenCalledWith({
          host: '127.0.0.1',
          port: 3306,
          user: 'Helias',
          password: 'helias123',
          database: 'helias_world',
        });
      }),
    );
  });

  describe('the load recent menu', () => {
    it(
      'should be disabled when there are no recent configs [null]',
      waitForAsync(async () => {
        const { page, connectionWindowService } = setup(false);
        connectionWindowService.getConfigs.and.returnValue([]);

        page.detectChanges();
        await page.whenStable();

        expect(page.loadRecentBtn.disabled).toBe(true);
      }),
    );

    it(
      'should be disabled when there are no recent configs [empty array]',
      waitForAsync(async () => {
        const { page, connectionWindowService } = setup(false);
        connectionWindowService.getConfigs.and.returnValue([]);

        page.detectChanges();
        await page.whenStable();

        expect(page.loadRecentBtn.disabled).toBe(true);
      }),
    );

    it(
      'should be enabled when there are recent configs, allowing the user to select them',
      waitForAsync(async () => {
        const { page, connectionWindowService } = setup(false);
        connectionWindowService.getConfigs.and.returnValue(mockConfigsWithPass);

        page.detectChanges();
        await page.whenStable();

        expect(page.loadRecentBtn.disabled).toBe(false);
        // TODO: ideally we should click the dropdown and do more checks
        //  but we can't because of: https://github.com/valor-software/ngx-bootstrap/issues/4282
      }),
    );

    it(
      'clear all should correctly work',
      waitForAsync(async () => {
        const { page, component, connectionWindowService } = setup();

        // TODO: ideally we should click the dropdown's item instead of calling the method
        //  but we can't because of: https://github.com/valor-software/ngx-bootstrap/issues/4282
        component.removeAllConfigs();

        expect(connectionWindowService.removeAllConfigs).toHaveBeenCalledTimes(1);
        expect(component.configs).toEqual([]);
        expect(page.hostInput.value).toBe('');
        expect(page.portInput.value).toBe('');
        expect(page.userInput.value).toBe('');
        expect(page.passwordInput.value).toBe('');
        expect(page.databaseInput.value).toBe('');
      }),
    );

    it(
      'loadConfig should correctly work',
      waitForAsync(async () => {
        const { page, component } = setup();

        // TODO: ideally we should click the dropdown's item instead of calling the method
        //  but we can't because of: https://github.com/valor-software/ngx-bootstrap/issues/4282
        component.loadConfig(mockConfigsWithPass[0]);

        expect(page.hostInput.value).toBe(mockConfigsWithPass[0].host);
        expect(page.portInput.value).toBe(String(mockConfigsWithPass[0].port));
        expect(page.userInput.value).toBe(mockConfigsWithPass[0].user);
        expect(page.passwordInput.value).toBe(mockConfigsWithPass[0].password);
        expect(page.databaseInput.value).toBe(mockConfigsWithPass[0].database);
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
    reset(MockedMysqlService);
  });
});
