import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { TableBrowserComponent } from './table-browser.component';

class TableBrowserPage extends PageObject<TableBrowserComponent> {
  table(): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByCss('#table-browser-table');
  }
  tableNames(): string[] {
    return Array.from(this.queryAll<HTMLOptionElement>('#table-browser-tables option')).map((option) => option.value);
  }
  limit(): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByCss('#table-browser-limit');
  }
  addButton(assert = true): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#table-browser-add', assert);
  }
  searchButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#table-browser-search');
  }
  sql(): string {
    return this.getDebugElementByCss('#table-browser-query').nativeElement.textContent ?? '';
  }
  join(i: number, assert = true): DebugHtmlElement<HTMLSelectElement> {
    return this.getDebugElementByTestId(`join-${i}`, assert);
  }
  field(i: number): DebugHtmlElement<HTMLSelectElement> {
    return this.getDebugElementByTestId(`field-${i}`);
  }
  operator(i: number): DebugHtmlElement<HTMLSelectElement> {
    return this.getDebugElementByTestId(`operator-${i}`);
  }
  value(i: number, assert = true): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByTestId(`value-${i}`, assert);
  }
  remove(i: number): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByTestId(`remove-${i}`);
  }
  count(assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByCss('#table-browser-count', assert);
  }
  error(assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByCss('keira-query-error', assert);
  }

  async change(element: DebugHtmlElement<HTMLInputElement | HTMLSelectElement>, value: string, event = 'change'): Promise<void> {
    element.nativeElement.value = value;
    element.nativeElement.dispatchEvent(new Event(event));
    await this.whenStable();
    this.fixture.detectChanges();
  }
  async click(element: DebugHtmlElement<HTMLElement>): Promise<void> {
    element.nativeElement.click();
    await this.whenStable();
    this.fixture.detectChanges();
  }
}

describe(TableBrowserComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TableBrowserComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  const setup = async () => {
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'getTables').mockReturnValue(
      of([{ Tables_in_acore_world: 'waypoints' }, { Tables_in_acore_world: 'areatrigger' }]),
    );
    const getColumns = vi.spyOn(queryService, 'getColumns').mockReturnValue(of([{ Field: 'entry' }, { Field: 'name' }]));
    const query = vi.spyOn(queryService, 'query').mockReturnValue(of([{ entry: 1, name: 'a' }]));
    const page = new TableBrowserPage(TestBed.createComponent(TableBrowserComponent));
    page.fixture.detectChanges();
    await page.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    page.fixture.detectChanges();
    return { page, getColumns, query };
  };

  it('lists the tables, then the columns of the one chosen', async () => {
    const { page, getColumns } = await setup();
    expect(page.tableNames()).toEqual(['areatrigger', 'waypoints']);
    expect(page.addButton(false)).toBeFalsy();

    await page.change(page.table(), 'waypoints');

    expect(getColumns).toHaveBeenCalledWith('waypoints');
    expect(page.sql()).toBe('SELECT * FROM `waypoints` LIMIT 100');
  });

  it('builds the conditions and shows the rows found', async () => {
    const { page, query } = await setup();
    await page.change(page.table(), 'waypoints');

    await page.click(page.addButton());
    await page.change(page.value(0), '5', 'input');
    await page.click(page.addButton());
    expect(page.join(0, false)).toBeFalsy();
    await page.change(page.join(1), 'OR');
    await page.change(page.field(1), 'name');
    await page.change(page.operator(1), 'IS NULL');
    expect(page.value(1, false)).toBeFalsy();
    await page.change(page.limit(), '7', 'input');

    expect(page.sql()).toBe('SELECT * FROM `waypoints` WHERE `entry` = 5 OR `name` IS NULL LIMIT 7');

    await page.click(page.searchButton());
    expect(query).toHaveBeenCalledWith('SELECT * FROM `waypoints` WHERE `entry` = 5 OR `name` IS NULL LIMIT 7');
    expect(page.count()).toBeTruthy();

    await page.click(page.remove(0));
    expect(page.sql()).toBe('SELECT * FROM `waypoints` WHERE `name` IS NULL LIMIT 7');
  });

  it('shows the error of a failed query, and no rows', async () => {
    const { page, query } = await setup();
    await page.change(page.table(), 'waypoints');
    query.mockReturnValue(throwError(() => ({ code: 'ER', sqlMessage: 'bad' })));

    await page.click(page.searchButton());

    expect(page.error()).toBeTruthy();
    expect(page.count()).toBeTruthy();
  });

  it('works with a table without columns, and a failed table list', async () => {
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'getTables').mockReturnValue(throwError(() => ({ code: 'ER', sqlMessage: 'bad' })));
    vi.spyOn(queryService, 'getColumns').mockReturnValue(throwError(() => ({ code: 'ER', sqlMessage: 'bad' })));
    const page = new TableBrowserPage(TestBed.createComponent(TableBrowserComponent));
    page.fixture.detectChanges();
    await page.whenStable();
    page.fixture.detectChanges();
    expect(page.tableNames()).toEqual([]);

    await page.change(page.table(), 'x');
    expect(page.addButton(false)).toBeFalsy();
  });
});
