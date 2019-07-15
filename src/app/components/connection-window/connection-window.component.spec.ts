import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { instance, reset } from 'ts-mockito';
import { MysqlError } from 'mysql';
import { of, throwError } from 'rxjs';
import Spy = jasmine.Spy;

import { ConnectionWindowComponent } from './connection-window.component';
import { MockedMysqlService } from '../../test-utils/mocks';
import { MysqlService } from '../../services/mysql.service';
import { PageObject } from '../../test-utils/page-object';
import { ConnectionWindowModule } from './connection-window.module';

class ConnectionWindowComponentPage extends PageObject<ConnectionWindowComponent> {
  get hostInput() { return this.query<HTMLInputElement>('#host'); }
  get portInput() { return this.query<HTMLInputElement>('#port'); }
  get userInput() { return this.query<HTMLInputElement>('#user'); }
  get passwordInput() { return this.query<HTMLInputElement>('#password'); }
  get databaseInput() { return this.query<HTMLInputElement>('#database'); }
  get connectBtn() { return this.query<HTMLButtonElement>('.connect-button'); }
  get errorElement() { return this.query<HTMLButtonElement>('app-query-error'); }
}

describe('ConnectionWindowComponent', () => {
  let component: ConnectionWindowComponent;
  let fixture: ComponentFixture<ConnectionWindowComponent>;
  let page: ConnectionWindowComponentPage;
  let connectSpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ConnectionWindowModule ],
      providers: [
        { provide : MysqlService, useValue: instance(MockedMysqlService) },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    connectSpy = spyOn(TestBed.get(MysqlService), 'connect').and.returnValue(of({}));

    fixture = TestBed.createComponent(ConnectionWindowComponent);
    page = new ConnectionWindowComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('clicking on the connect button without altering the default values should correctly work', () => {
    component.error = { code: 'some previous error', errno: 1234 } as MysqlError;

    page.clickElement(page.connectBtn);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    expect(connectSpy).toHaveBeenCalledWith({
      'host': '127.0.0.1',
      'port': '3306',
      'user': 'root',
      'password': 'root',
      'database': 'acore_world',
    });
    expect(component.error).toBeNull();
    expect(page.errorElement.innerHTML).not.toContain('error-box');
  });

  it('filling the form and clicking on the connect button should correctly work', () => {
    const host = '192.168.1.100';
    const port = '9000';
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
    fixture.debugElement.nativeElement.remove();
    reset(MockedMysqlService);
  });
});
