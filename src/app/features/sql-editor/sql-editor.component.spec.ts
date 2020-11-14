import { TestBed, waitForAsync } from '@angular/core/testing';

import { SqlEditorComponent } from './sql-editor.component';
import { SqlEditorModule } from './sql-editor.module';
import { PageObject } from '@keira-testing/page-object';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { of, throwError } from 'rxjs';
import { ClipboardService } from 'ngx-clipboard';
import { MysqlError } from 'mysql';
import Spy = jasmine.Spy;

export class SqlEditorPage extends PageObject<SqlEditorComponent> {
  readonly DT = 'ngx-datatable';

  get affectedRows() { return this.query<HTMLTextAreaElement>('#affected-rows-box'); }
  get code() { return this.query<HTMLTextAreaElement>('textarea#code'); }
  get copyBtn() { return this.query<HTMLButtonElement>('#copy-btn'); }
  get executeBtn() { return this.query<HTMLButtonElement>('#execute-btn'); }
  get errorElement() { return this.query<HTMLButtonElement>('keira-query-error'); }
}

describe('SqlEditorComponent', () => {

  const mockRows = [
    { col1: 'x1', col2: 'x2', col3: 'x3' },
    { col1: 'y1', col2: 'y2', col3: 'y3' },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SqlEditorModule],
    })
      .compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(SqlEditorComponent);
    const component = fixture.componentInstance;
    const page = new SqlEditorPage(fixture);
    const mysqlQueryService = TestBed.inject(MysqlQueryService);
    spyOn(mysqlQueryService, 'query').and.returnValue(of(mockRows));

    fixture.detectChanges();

    return { page, mysqlQueryService, component };
  };

  it('should correctly query', async() => {
    const { page, mysqlQueryService } = setup();
    await page.whenStable();

    page.clickElement(page.executeBtn);

    expect(mysqlQueryService.query).toHaveBeenCalledWith(page.code.value);
    expect(mysqlQueryService.query).toHaveBeenCalledTimes(1);
    expect(page.getDatatableCell(0, 0).innerText).toEqual(mockRows[0].col1);
    expect(page.getDatatableCell(0, 1).innerText).toEqual(mockRows[0].col2);
    expect(page.getDatatableCell(0, 2).innerText).toEqual(mockRows[0].col3);
    expect(page.getDatatableCell(1, 0).innerText).toEqual(mockRows[1].col1);
    expect(page.getDatatableCell(1, 1).innerText).toEqual(mockRows[1].col2);
    expect(page.getDatatableCell(1, 2).innerText).toEqual(mockRows[1].col3);
  });

  it('should allow the user to insert a custom query', async() => {
    const { page, mysqlQueryService } = setup();
    await page.whenStable();
    const customQuery = 'SELECT col FROM table WHERE col > 10';

    page.setInputValue(page.code, customQuery);
    page.clickElement(page.executeBtn);

    expect(mysqlQueryService.query).toHaveBeenCalledWith(customQuery);
    expect(mysqlQueryService.query).toHaveBeenCalledTimes(1);
  });

  it('should show an error if the query fails', async() => {
    const { page, mysqlQueryService } = setup();
    const error = {
      code: 'some error happened',
      errno: 1000,
      sqlMessage: 'some SQL error message',
      sqlState: 'some SQL state'
    } as MysqlError;
    (mysqlQueryService.query as Spy).and.returnValue(throwError(error));

    await page.whenStable();

    page.clickElement(page.executeBtn);

    expect(page.errorElement.innerHTML).toContain(error.code);
    expect(page.errorElement.innerHTML).toContain(error.sqlMessage);
    expect(page.errorElement.innerHTML).toContain(error.sqlState);
    expect(page.errorElement.innerHTML).toContain(`${error.errno}`);
  });

  it('should have no colums if the result is an empty set', async() => {
    const { page, mysqlQueryService, component } = setup();
    (mysqlQueryService.query as Spy).and.returnValue(of([]));
    await page.whenStable();

    page.clickElement(page.executeBtn);

    expect(component.columns.length).toBe(0);
  });

  it('should display the affected rows box when necessary', async() => {
    const { page, mysqlQueryService } = setup();
    const affectedRows = 12012;
    const message = '- Some message';
    (mysqlQueryService.query as Spy).and.returnValue(of({ affectedRows, message }));
    await page.whenStable();

    page.clickElement(page.executeBtn);

    expect(page.affectedRows.innerText).toContain(String(affectedRows));
    expect(page.affectedRows.innerText).toContain(message);
  });

  it('should cut the columns amount when there are too many', async() => {
    const { page, mysqlQueryService, component } = setup();
    (mysqlQueryService.query as Spy).and.returnValue(of([{
      a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1, j: 1, k: 1, l: 1, m: 1, n: 1, o: 1, p: 1, q: 1, r: 1, s: 1, t: 1, u: 1
    }]));
    await page.whenStable();

    page.clickElement(page.executeBtn);

    expect(component.columns.length).toBe(20);
  });

  it('clicking the copy button should copy the query', () => {
    const { page } = setup();
    const spy = spyOn(TestBed.inject(ClipboardService), 'copyFromContent');
    const customQuery = '-- some text that will be copied';

    page.setInputValue(page.code, customQuery);
    page.clickElement(page.copyBtn);

    expect(spy).toHaveBeenCalledWith(customQuery);
  });
});
