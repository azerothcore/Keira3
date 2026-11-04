import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SessionSqlService } from '@keira/shared/common-services';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ClipboardService } from 'ngx-clipboard';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { SNIFF } from './sniff.mock';
import { SniffToSqlComponent } from './sniff-to-sql.component';

class SniffPage extends PageObject<SniffToSqlComponent> {
  el<T extends HTMLElement>(id: string, assert = true): T {
    return this.query<T>(`#${id}`, assert);
  }
  async type(id: string, value: string, event = 'input'): Promise<void> {
    const element = this.el<HTMLInputElement>(id);
    element.value = value;
    element.dispatchEvent(new Event(event));
    await this.settle();
  }
  async click(id: string): Promise<void> {
    this.el(id).click();
    await this.settle();
  }
  async settle(): Promise<void> {
    await this.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    this.fixture.detectChanges();
  }
}

describe(SniffToSqlComponent.name, () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [SniffToSqlComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), { provide: MysqlService, useValue: instance(mock(MysqlService)) }],
    });
  });

  const setup = async () => {
    const query = vi.spyOn(TestBed.inject(MysqlQueryService), 'query').mockImplementation(((sql: string) => {
      if (sql.startsWith('SELECT MAX(`id`)')) {
        return of([{ max: 99 }]);
      }
      if (sql.startsWith('SELECT MAX(`entry`)')) {
        return of(undefined);
      }
      if (sql.includes('broadcast_text')) {
        return of([
          { ID: 1234, MaleText: "Don't move!", FemaleText: '' },
          { ID: 1235, MaleText: '', FemaleText: "Don't move!" },
        ]);
      }
      return of([{ CreatureID: 18287, next: 2 }]);
    }) as never);
    const page = new SniffPage(TestBed.createComponent(SniffToSqlComponent));
    page.fixture.detectChanges();
    await page.settle();
    return { page, query };
  };

  it('reads a sniff into waypoints and creature texts, from the free ids of the database', async () => {
    const { page, query } = await setup();
    expect(page.el<HTMLButtonElement>('sniff-parse').disabled).toBe(true);

    await page.type('sniff-text', SNIFF);
    await page.click('sniff-parse');

    expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE `MaleText` IN ('Don\\'t move!', 'For the Horde!', 'waves.')"));
    const sql = page.el('sniff-sql').textContent ?? '';
    expect(sql).toContain('SET @PATH := 100;');
    expect(sql).toContain("(18287, 2, 0, 'Don\\'t move!', 12, 0, 100, 0, 0, 0, 1234, 0, 'creature 18287')");
    expect(page.el('sniff-summary').textContent).toContain('SNIFF_TO_SQL.SUMMARY');

    await page.type('sniff-first-path', '500');
    expect(page.el('sniff-sql').textContent).toContain('SET @PATH := 500;');
    await page.type('sniff-first-path', '');
    expect(page.el('sniff-sql').textContent).toContain('SET @PATH := 1;');
  });

  it('writes the paths as waypoints, copies the SQL and keeps it in the session', async () => {
    const { page } = await setup();
    const copy = vi.spyOn(TestBed.inject(ClipboardService), 'copyFromContent').mockImplementation(() => true);
    const session = TestBed.inject(SessionSqlService);
    session.clear();
    await page.type('sniff-text', SNIFF.split('ServerToClient: SMSG_MESSAGECHAT')[0]);
    const select = page.el<HTMLSelectElement>('sniff-table');
    select.value = 'waypoints';
    select.dispatchEvent(new Event('change'));
    await page.settle();
    await page.click('sniff-parse');

    expect(page.el('sniff-sql').textContent).toContain('INSERT INTO `waypoints`');
    expect(page.el('sniff-sql').textContent).toContain('SET @PATH := 1;');
    expect(page.el('sniff-sql').textContent).not.toContain('creature_text');

    await page.click('sniff-copy');
    expect(copy).toHaveBeenCalled();
    await page.click('sniff-session');
    expect(session.entries()[0].label).toBe('sniff');
    expect(page.el<HTMLButtonElement>('sniff-session').disabled).toBe(true);
    session.clear();
  });

  it('says when nothing was found, and shows the errors of the database', async () => {
    const { page, query } = await setup();
    await page.type('sniff-text', 'nothing here');
    await page.click('sniff-parse');
    expect(page.el('sniff-nothing')).toBeTruthy();

    query.mockReturnValue(throwError(() => ({ sqlMessage: 'no table' })) as never);
    await page.click('sniff-parse');
    expect(page.el('sniff-error').textContent).toContain('no table');

    query.mockReturnValue(throwError(() => new Error('down')) as never);
    await page.click('sniff-parse');
    expect(page.el('sniff-error').textContent).toContain('down');

    query.mockReturnValue(throwError(() => 'gone') as never);
    await page.click('sniff-parse');
    expect(page.el('sniff-error').textContent).toContain('gone');
  });

  it('works when the database answers nothing', async () => {
    const { page, query } = await setup();
    query.mockReturnValue(of(undefined) as never);
    await page.type('sniff-text', SNIFF);
    await page.click('sniff-parse');
    expect(page.el('sniff-sql').textContent).toContain("'Don\\'t move!', 12, 0, 100, 0, 0, 0, 0, 0");
  });
});
