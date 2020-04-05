import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';
import { ConnectionConfig, MysqlError } from 'mysql';
import { of, throwError } from 'rxjs';

import { ConnectionWindowComponent } from './connection-window.component';
import { MockedMysqlService } from '@keira-testing/mocks';
import { MysqlService } from '../../shared/services/mysql.service';
import { PageObject } from '@keira-testing/page-object';
import { ConnectionWindowModule } from './connection-window.module';
import { ConnectionWindowService } from './connection-window.service';

class ConnectionWindowComponentPage extends PageObject<ConnectionWindowComponent> {
  get hostInput() { return this.query<HTMLInputElement>('#host'); }
  get portInput() { return this.query<HTMLInputElement>('#port'); }
  get userInput() { return this.query<HTMLInputElement>('#user'); }
  get passwordInput() { return this.query<HTMLInputElement>('#password'); }
  get databaseInput() { return this.query<HTMLInputElement>('#database'); }
  get connectBtn() { return this.query<HTMLButtonElement>('.connect-button'); }
  get errorElement() { return this.query<HTMLButtonElement>('keira-query-error'); }
}

describe('ConnectionWindowComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ConnectionWindowModule ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ],
    })
      .compileComponents();
  }));

  const setup = (detectChanges = true) => {
    const connectSpy = spyOn(TestBed.inject(MysqlService), 'connect').and.returnValue(of({}));

    const fixture = TestBed.createComponent(ConnectionWindowComponent);
    const page = new ConnectionWindowComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);

    if (detectChanges) {
      fixture.detectChanges();
    }

    return { fixture, page, component, connectSpy };
  };

  it('clicking on the connect button without altering the default values should correctly work', fakeAsync(() => {
    const { page, component, connectSpy } = setup();
    component.error = { code: 'some previous error', errno: 1234 } as MysqlError;

    tick();

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({
      'host': '127.0.0.1',
      'port': 3306,
      'user': 'root',
      'password': 'root',
      'database': 'acore_world',
    });
    expect(component.error).toBeNull();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  }));

  it('the latest config should be loaded by default (if any)', fakeAsync(() => {
    const mockConfigs: Partial<ConnectionConfig>[] = [
      {
        host: 'localhost',
        port: 3306,
        user: 'Helias',
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
    spyOn(TestBed.inject(ConnectionWindowService), 'getConfigs').and.returnValue(mockConfigs);
    const { fixture, page, component, connectSpy } = setup(false);
    component.error = { code: 'some previous error', errno: 1234 } as MysqlError;

    fixture.detectChanges();
    tick();

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({
      'host': '127.0.0.1',
      'port': 3306,
      'user': 'Helias',
      'password': 'helias123',
      'database': 'helias_world',
    });

    expect(component.error).toBeNull();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  }));

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
      sqlState: 'some SQL state'
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


  afterEach(() => {
    localStorage.clear();
    reset(MockedMysqlService);
  });
});
