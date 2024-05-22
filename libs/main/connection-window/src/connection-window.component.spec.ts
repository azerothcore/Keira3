import { TestBed, waitForAsync } from '@angular/core/testing';
import { PageObject, Spied, TranslateTestingModule } from '@keira/shared/test-utils';
import { ConnectionOptions, QueryError } from 'mysql2';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';

import { ConnectionWindowComponent } from './connection-window.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginConfigService } from '@keira/shared/login-config';
import { MysqlService } from '@keira/shared/db-layer';

class ConnectionWindowComponentPage extends PageObject<ConnectionWindowComponent> {
  get hostInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#host');
  }
  get portInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#port');
  }
  get userInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#user');
  }
  get passwordInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#password');
  }
  get databaseInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#database');
  }
  get connectBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('.connect-button');
  }
  get errorElement(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('keira-query-error');
  }
  get savePasswordInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#save-password');
  }
  get rememberMeInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#remember-me');
  }
  get loadRecentBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#load-recent button');
  }
  get clearAll(): HTMLUListElement {
    return this.query<HTMLUListElement>('#clear-all');
  }
  get recentConfigs(): HTMLUListElement[] {
    return this.queryAll<HTMLUListElement>('.config-item');
  }
}

describe('ConnectionWindowComponent', () => {
  const mockConfigsWithPass: Partial<ConnectionOptions>[] = [
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
  const mockConfigsNoPass: Partial<ConnectionOptions>[] = [
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, TooltipModule.forRoot(), ConnectionWindowComponent, TranslateTestingModule],
      providers: [
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
        {
          provide: LoginConfigService,
          useValue: jasmine.createSpyObj('LoginConfigService', [
            'getConfigs',
            'removeAllConfigs',
            'saveNewConfig',
            'isRememberMeEnabled',
            'saveRememberPreference',
          ]),
        },
      ],
    }).compileComponents();
  }));

  const setup = (detectChanges = true) => {
    const connectSpy = spyOn(TestBed.inject(MysqlService), 'connect').and.returnValue(of({}));
    const loginConfigService = TestBed.inject(LoginConfigService) as unknown as Spied<LoginConfigService>;

    const fixture = TestBed.createComponent(ConnectionWindowComponent);
    const page = new ConnectionWindowComponentPage(fixture);
    const component = fixture.componentInstance;

    if (detectChanges) {
      fixture.detectChanges();
      fixture.autoDetectChanges(true);
    }

    return { fixture, page, component, connectSpy, loginConfigService };
  };

  it('clicking on the connect button without altering the default values should correctly work', () => {
    const { page, component, connectSpy } = setup();
    component.error = { code: 'some previous error', errno: 1234 } as QueryError;

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'acore_world',
    });
    expect(component.error).toBeUndefined();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  });

  it('the latest config should be loaded by default (if any)', () => {
    const { fixture, page, component, connectSpy, loginConfigService } = setup(false);
    loginConfigService.getConfigs.and.returnValue(mockConfigsWithPass);
    component.error = { code: 'some previous error', errno: 1234 } as QueryError;
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

    expect(component.error).toBeUndefined();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  });

  it('filling the form and clicking on the connect button should correctly work', () => {
    const { page, component, connectSpy } = setup();
    const host = '192.168.1.100';
    const port = 9000;
    const user = 'shin';
    const password = 'helias';
    const database = 'my_world';
    component.error = { code: 'some previous error', errno: 1234 } as QueryError;

    page.setInputValue(page.hostInput, host);
    page.setInputValue(page.portInput, port);
    page.setInputValue(page.userInput, user);
    page.setInputValue(page.passwordInput, password);
    page.setInputValue(page.databaseInput, database);
    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({ host, port, user, password, database });
    expect(component.error).toBeUndefined();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  });

  it('should correctly react on mysql connection error', () => {
    const { page, component, connectSpy } = setup();
    const error = {
      code: 'some error happened',
      errno: 1000,
      stack: 'some SQL error message',
      sqlState: 'some SQL state',
    } as QueryError;
    connectSpy.and.returnValue(throwError(error));

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(component.error).toEqual(error);
    expect(page.errorElement.innerHTML).toContain('error-box');
    expect(page.errorElement.innerHTML).toContain(error.code);
    expect(page.errorElement.innerHTML).toContain(error.stack as string);
    expect(page.errorElement.innerHTML).toContain(error.sqlState as string);
    expect(page.errorElement.innerHTML).toContain(`${error.errno}`);
  });

  describe('the save checkbox', () => {
    it('should be checked by default when there is no config', waitForAsync(async () => {
      const { page, loginConfigService } = setup(false);
      loginConfigService.getConfigs.and.returnValue(null);

      page.detectChanges();
      await page.whenStable();

      expect(page.savePasswordInput.checked).toBe(true);
    }));

    it('should be checked by default when the last used config has a non-empty password', waitForAsync(async () => {
      const { page, loginConfigService } = setup(false);
      loginConfigService.getConfigs.and.returnValue(mockConfigsWithPass);

      page.detectChanges();
      await page.whenStable();

      expect(page.savePasswordInput.checked).toBe(true);
      expect(page.rememberMeInput.disabled).toBe(false);
    }));

    it('should be unchecked by default when the last used config has an empty password', waitForAsync(async () => {
      const { page, loginConfigService } = setup(false);
      loginConfigService.getConfigs.and.returnValue(mockConfigsNoPass);

      page.detectChanges();
      await page.whenStable();

      expect(page.savePasswordInput.checked).toBe(false);
      expect(page.rememberMeInput.disabled).toBe(true);
    }));

    it('when selected, the password should be saved', waitForAsync(async () => {
      const password = 'opensource';
      const { page, loginConfigService, connectSpy } = setup(false);
      loginConfigService.getConfigs.and.returnValue(mockConfigsNoPass); // initially unselected, password empty
      page.detectChanges();
      await page.whenStable();

      page.setInputValue(page.passwordInput, password); // test toggle
      page.clickElement(page.savePasswordInput); // test toggle
      page.clickElement(page.connectBtn);

      expect(loginConfigService.saveNewConfig).toHaveBeenCalledTimes(1);
      expect(loginConfigService.saveNewConfig).toHaveBeenCalledWith({
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
    }));

    it('when unselected, the password should NOT be saved', waitForAsync(async () => {
      const { page, loginConfigService, connectSpy } = setup(false);
      loginConfigService.getConfigs.and.returnValue(mockConfigsWithPass); // initially selected, password filled
      page.detectChanges();
      await page.whenStable();

      page.clickElement(page.savePasswordInput); // test toggle
      page.clickElement(page.connectBtn);

      expect(loginConfigService.saveNewConfig).toHaveBeenCalledTimes(1);
      expect(loginConfigService.saveNewConfig).toHaveBeenCalledWith({
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
    }));
  });

  describe('remember me checkbox', () => {
    it('when isRememberMeEnabled return true it should call onConnect', waitForAsync(async () => {
      const { page, component, loginConfigService } = setup(false);
      spyOn(component, 'onConnect');
      loginConfigService.getConfigs.and.returnValue(mockConfigsWithPass);
      loginConfigService.isRememberMeEnabled.and.returnValue(true);

      page.detectChanges();
      await page.whenStable();

      expect(component.onConnect).toHaveBeenCalledTimes(1);
    }));
  });

  describe('the load recent menu', () => {
    it('should be disabled when there are no recent configs [null]', waitForAsync(async () => {
      const { page, loginConfigService } = setup(false);
      loginConfigService.getConfigs.and.returnValue([]);

      page.detectChanges();
      await page.whenStable();

      expect(page.loadRecentBtn.disabled).toBe(true);
    }));

    it('should be disabled when there are no recent configs [empty array]', waitForAsync(async () => {
      const { page, loginConfigService } = setup(false);
      loginConfigService.getConfigs.and.returnValue([]);

      page.detectChanges();
      await page.whenStable();

      expect(page.loadRecentBtn.disabled).toBe(true);
    }));

    it('should be enabled when there are recent configs, allowing the user to select them', waitForAsync(async () => {
      const { page, loginConfigService } = setup(false);
      loginConfigService.getConfigs.and.returnValue(mockConfigsWithPass);

      page.detectChanges();
      await page.whenStable();

      expect(page.loadRecentBtn.disabled).toBe(false);
      // TODO: ideally we should click the dropdown and do more checks
      //  but we can't because of: https://github.com/valor-software/ngx-bootstrap/issues/4282
    }));

    it('clear all should correctly work', waitForAsync(async () => {
      const { page, component, loginConfigService } = setup();

      // TODO: ideally we should click the dropdown's item instead of calling the method
      //  but we can't because of: https://github.com/valor-software/ngx-bootstrap/issues/4282
      component.removeAllConfigs();

      expect(loginConfigService.removeAllConfigs).toHaveBeenCalledTimes(1);
      expect(component.configs).toEqual([]);
      expect(page.hostInput.value).toBe('');
      expect(page.portInput.value).toBe('');
      expect(page.userInput.value).toBe('');
      expect(page.passwordInput.value).toBe('');
      expect(page.databaseInput.value).toBe('');
    }));

    it('loadConfig should correctly work', waitForAsync(async () => {
      const { page, component } = setup();

      // TODO: ideally we should click the dropdown's item instead of calling the method
      //  but we can't because of: https://github.com/valor-software/ngx-bootstrap/issues/4282
      component.loadConfig(mockConfigsWithPass[0]);

      expect(page.hostInput.value).toBe(mockConfigsWithPass[0].host as string);
      expect(page.portInput.value).toBe(String(mockConfigsWithPass[0].port));
      expect(page.userInput.value).toBe(mockConfigsWithPass[0].user as string);
      expect(page.passwordInput.value).toBe(mockConfigsWithPass[0].password as string);
      expect(page.databaseInput.value).toBe(mockConfigsWithPass[0].database as string);
    }));
  });

  afterEach(() => {
    localStorage.clear();
  });
});
