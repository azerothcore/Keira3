import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SessionSqlService } from '@keira/shared/common-services';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ClipboardService } from 'ngx-clipboard';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { SessionSqlComponent, sessionFileName } from './session-sql.component';

class SessionSqlPage extends PageObject<SessionSqlComponent> {
  button(id: string): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss(`#${id}`);
  }
  rows(): HTMLTableRowElement[] {
    return Array.from(this.fixture.nativeElement.querySelectorAll('#session-entries tr'));
  }
  async press(id: string): Promise<void> {
    this.button(id).nativeElement.click();
    await this.whenStable();
    this.fixture.detectChanges();
  }
}

describe(SessionSqlComponent.name, () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [SessionSqlComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  const setup = () => {
    const session = TestBed.inject(SessionSqlService);
    session.add('creature_template 1', 'UPDATE a;');
    session.add('smart_scripts -5', 'DELETE b;');
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockReturnValue(of([]));
    const copy = vi.spyOn(TestBed.inject(ClipboardService), 'copyFromContent').mockImplementation(() => true);
    const page = new SessionSqlPage(TestBed.createComponent(SessionSqlComponent));
    page.fixture.detectChanges();
    return { page, session, query, copy };
  };

  it('lists the queries put aside, to reorder or drop', () => {
    const { page } = setup();
    expect(page.rows().length).toBe(2);
    expect(page.rows()[0].textContent).toContain('creature_template 1');

    page.rows()[1].querySelectorAll('button')[0].click();
    page.fixture.detectChanges();
    expect(page.rows()[0].textContent).toContain('smart_scripts -5');
    page.rows()[0].querySelectorAll('button')[1].click();
    page.fixture.detectChanges();
    page.rows()[1].querySelectorAll('button')[2].click();
    page.fixture.detectChanges();
    expect(page.rows().length).toBe(1);
    expect(page.rows()[0].textContent).toContain('creature_template 1');
  });

  it('copies them, saves them as a .sql file, executes them all', async () => {
    const { page, query, copy } = setup();
    const createUrl = vi.fn().mockReturnValue('blob:x');
    const revoke = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: createUrl, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    await page.press('session-copy');
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('-- creature_template 1\nUPDATE a;'));

    await page.press('session-save');
    expect(createUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:x');
    vi.unstubAllGlobals();

    await page.press('session-execute');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('DELETE b;'));
    expect(page.query('#session-executed')).toBeTruthy();
  });

  it('shows the error of a failed execution, and is empty once cleared', async () => {
    const { page, query } = setup();
    query.mockReturnValue(throwError(() => ({ code: 'ER_PARSE_ERROR', message: 'bad' })));

    await page.press('session-execute');
    expect(page.query('keira-query-error')).toBeTruthy();
    expect(page.query('#session-executed', false)).toBeFalsy();

    await page.press('session-clear');
    expect(page.query('#session-empty')).toBeTruthy();
  });

  it('names the file by the day', () => {
    expect(sessionFileName(new Date('2026-11-04T10:00:00Z'))).toBe('keira-session-2026-11-04.sql');
    expect(sessionFileName()).toMatch(/^keira-session-\d{4}-\d{2}-\d{2}\.sql$/);
  });
});
