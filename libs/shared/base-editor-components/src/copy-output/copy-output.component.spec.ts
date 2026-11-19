import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { SessionSqlService } from '@keira/shared/common-services';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ClipboardService } from 'ngx-clipboard';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { of, throwError } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CopyOutputComponent } from './copy-output.component';
import { RelatedTable } from './copy-output.model';

class CopyOutputPage extends PageObject<CopyOutputComponent<TableRow>> {
  includeAll(): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByCss('#include-all');
  }
  include(table: string, assert = true): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByCss(`#include-${table}`, assert);
  }
  allRaw(): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByCss('#header-copy-mode');
  }
  raw(table: string): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByCss(`#switch-${table}`);
  }
  sql(): DebugHtmlElement<HTMLDivElement> {
    return this.getDebugElementByCss('#sql-output');
  }
  expandButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#expand-sql-btn');
  }
  copyButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#copy-btn');
  }
  copyIconButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#copy-icon-btn');
  }
  executeButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#execute-btn');
  }
  continueButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#continue-btn');
  }
  saveButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#save-sql-btn');
  }
  sessionButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#add-to-session-btn');
  }
  backButton(): DebugHtmlElement<HTMLButtonElement> {
    return this.getDebugElementByCss('#back-btn');
  }
  exportTitle(assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByCss('#export-title', assert);
  }
  executeButtonShown(): boolean {
    return this.queryAll('#execute-btn').length > 0;
  }
  error(assert = true): DebugHtmlElement<HTMLElement> {
    return this.getDebugElementByCss('keira-query-error', assert);
  }

  sqlText(): string {
    return this.sql().nativeElement.textContent ?? '';
  }
  async click(element: DebugHtmlElement<HTMLElement>): Promise<void> {
    element.nativeElement.click();
    await this.whenStable();
    this.fixture.detectChanges();
  }
}

describe(CopyOutputComponent.name, () => {
  const rows: Record<string, TableRow[]> = {
    creature_template: [{ entry: 1, name: "Anub'Rekhan" }],
    creature_template_addon: [{ entry: 1, path_id: 0 }],
    npc_vendor: [],
    creature_queststarter: [{ id: 5, quest: 1 }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CopyOutputComponent, TranslateTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
      ],
    });
  });

  const setup = async (
    config: { relatedTables?: RelatedTable[]; sourceId?: string; exporting?: boolean; mainCopyMode?: 'ALL' } = {
      relatedTables: [
        { tableName: 'creature_template_addon', idField: 'entry' },
        { tableName: 'npc_vendor', idField: 'entry' },
      ],
    },
  ) => {
    const queryService = TestBed.inject(MysqlQueryService);
    vi.spyOn(queryService, 'getRowsCount').mockImplementation((table: string) => of(rows[table]?.length ?? null));
    vi.spyOn(queryService, 'selectAll').mockImplementation(((table: string) => of(rows[table])) as never);
    const query = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    const clipboard = vi.spyOn(TestBed.inject(ClipboardService), 'copyFromContent').mockImplementation(() => true);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const handlerService = {
      select: vi.fn(),
      sourceId: 'sourceId' in config ? config.sourceId : '1',
      selected: config.exporting ? '1' : '2',
      selectedName: 'Anub',
      exporting: !!config.exporting,
    };

    const page = new CopyOutputPage(TestBed.createComponent(CopyOutputComponent<TableRow>));
    page.fixture.componentRef.setInput('handlerService', handlerService as unknown as HandlerService<TableRow>);
    page.fixture.componentRef.setInput('selectRoute', 'creature/select');
    page.fixture.componentRef.setInput('tableName', 'creature_template');
    page.fixture.componentRef.setInput('idField', 'entry');
    page.fixture.componentRef.setInput('relatedTables', config.relatedTables);
    page.fixture.componentRef.setInput('mainCopyMode', config.mainCopyMode);
    page.fixture.detectChanges();
    await page.whenStable();
    page.fixture.detectChanges();
    return { page, query, clipboard, handlerService, navigate };
  };

  it('goes back to the search when no entry was chosen to copy', async () => {
    const { page, navigate, query } = await setup({ sourceId: undefined });

    expect(navigate).toHaveBeenCalledWith(['creature/select']);
    expect(page.include('creature_template', false)).toBeFalsy();
    expect(query).not.toHaveBeenCalled();
  });

  it('lists the main table and the related tables having rows, all copied with raw inserts', async () => {
    const { page } = await setup();

    expect(page.include('creature_template').nativeElement.checked).toBe(true);
    expect(page.include('creature_template_addon').nativeElement.checked).toBe(true);
    expect(page.include('npc_vendor', false)).toBeFalsy();
    expect(page.includeAll().nativeElement.checked).toBe(true);
    expect(page.allRaw().nativeElement.checked).toBe(true);
    expect(page.sqlText()).toContain('SET @SOURCE = 1;');
    expect(page.sqlText()).toContain('INSERT INTO `creature_template_addon`');
    expect(page.sqlText()).toContain("'Anub\\'Rekhan'");
  });

  it('copies a table as asked, and lists the main table even when its rows could not be counted', async () => {
    const { page } = await setup({
      relatedTables: [
        { tableName: 'creature_queststarter', idField: 'quest', copyMode: 'ALL' },
        { tableName: 'quest_template_addon', idField: 'ID' },
      ],
    });

    expect(page.raw('creature_queststarter').nativeElement.checked).toBe(false);
    expect(page.include('quest_template_addon', false)).toBeFalsy();
    expect(page.sqlText()).toContain('CREATE TEMPORARY TABLE');

    await page.click(page.raw('creature_queststarter'));
    expect(page.sqlText()).toContain('INSERT INTO `creature_queststarter` (`id`, `quest`)');
  });

  it('works without related tables', async () => {
    const { page } = await setup({ relatedTables: undefined });

    expect(page.include('creature_template').nativeElement.checked).toBe(true);
    expect(page.include('creature_template_addon', false)).toBeFalsy();
  });

  it('leaves a table out, then all of them but the main one, always copied', async () => {
    const { page } = await setup();
    expect(page.include('creature_template').nativeElement.disabled).toBe(true);

    await page.click(page.include('creature_template_addon'));
    expect(page.includeAll().nativeElement.checked).toBe(false);
    expect(page.sqlText()).not.toContain('creature_template_addon');

    await page.click(page.includeAll());
    expect(page.includeAll().nativeElement.checked).toBe(true);
    expect(page.sqlText()).toContain('creature_template_addon');

    await page.click(page.includeAll());
    expect(page.include('creature_template').nativeElement.checked).toBe(true);
    expect(page.sqlText()).toContain('INSERT INTO `creature_template`');
    expect(page.sqlText()).not.toContain('creature_template_addon');
  });

  it('marks the entry as existing once the copy ran', async () => {
    const { page, handlerService } = await setup();

    await page.click(page.executeButton());

    expect(handlerService.select).toHaveBeenCalledWith(false, '2', undefined, false);
  });

  it('copies a table, then all of them, through a temporary table', async () => {
    const { page } = await setup();

    await page.click(page.raw('creature_template_addon'));
    expect(page.raw('creature_template_addon').nativeElement.checked).toBe(false);
    expect(page.allRaw().nativeElement.checked).toBe(false);
    expect(page.sqlText()).toContain('CREATE TEMPORARY TABLE');
    expect(page.sqlText()).toContain("'Anub\\'Rekhan'");

    await page.click(page.raw('creature_template'));
    expect(page.sqlText()).not.toContain("'Anub\\'Rekhan'");

    await page.click(page.allRaw());
    expect(page.allRaw().nativeElement.checked).toBe(true);
    await page.click(page.allRaw());
    expect(page.raw('creature_template').nativeElement.checked).toBe(false);
    expect(page.raw('creature_template_addon').nativeElement.checked).toBe(false);
  });

  it('expands and collapses the query', async () => {
    const { page } = await setup();

    expect(page.sql().nativeElement.style.maxHeight).toBe('240px');
    await page.click(page.expandButton());
    expect(page.sql().nativeElement.style.maxHeight).toBe('none');
    await page.click(page.expandButton());
    expect(page.sql().nativeElement.style.maxHeight).toBe('240px');
  });

  it('copies the query to the clipboard', async () => {
    const { page, clipboard } = await setup();

    await page.click(page.copyButton());
    await page.click(page.copyIconButton());

    expect(clipboard).toHaveBeenCalledTimes(2);
    expect(clipboard.mock.calls[0][0]).toContain('SET @ENTRY = 2;');
  });

  it('executes the query, then continues to the new entry', async () => {
    const { page, query, handlerService } = await setup();
    expect(page.continueButton().nativeElement.disabled).toBe(true);

    await page.click(page.executeButton());

    expect(query).toHaveBeenCalledWith(expect.stringContaining('SET @ENTRY = 2;'));
    expect(page.executeButton().nativeElement.disabled).toBe(true);
    expect(page.continueButton().nativeElement.disabled).toBe(false);
    await page.click(page.continueButton());
    expect(handlerService.select).toHaveBeenCalledWith(false, '2');
  });

  it('shows the error when the query fails, and can be executed again', async () => {
    const { page, query } = await setup();
    query.mockReturnValue(throwError(() => ({ code: 'ER_DUP_ENTRY', sqlMessage: 'Duplicate entry' })));

    await page.click(page.executeButton());

    expect(page.error()).toBeTruthy();
    expect(page.executeButton().nativeElement.disabled).toBe(false);
    expect(page.continueButton().nativeElement.disabled).toBe(true);
  });

  it('saves the query as a .sql file, and keeps it in the session', async () => {
    const { page } = await setup();
    const session = TestBed.inject(SessionSqlService);
    session.clear();
    const createUrl = vi.fn(() => 'blob:x');
    const revokeUrl = vi.fn();
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revokeUrl });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    await page.click(page.saveButton());
    expect(click).toHaveBeenCalled();
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('creature_template-2-from-1.sql');
    expect(revokeUrl).toHaveBeenCalledWith('blob:x');

    await page.click(page.sessionButton());
    expect(session.entries()[0].label).toBe('creature_template 2 (1)');
    expect(session.entries()[0].query).toContain('SET @ENTRY = 2;');
    expect(page.sessionButton().nativeElement.disabled).toBe(true);
    session.clear();
    click.mockRestore();
  });

  it('exports the entity: every table as raw inserts, nothing to execute', async () => {
    const { page, handlerService } = await setup({
      exporting: true,
      mainCopyMode: 'ALL',
      relatedTables: [{ tableName: 'creature_queststarter', idField: 'id', copyMode: 'ALL' }],
    });
    const session = TestBed.inject(SessionSqlService);
    session.clear();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() });

    expect(page.exportTitle().nativeElement.textContent).toContain('creature_template 1');
    expect(page.executeButtonShown()).toBe(false);
    expect(page.sqlText()).not.toContain('CREATE TEMPORARY TABLE');
    expect(page.sqlText()).toContain("'Anub\\'Rekhan'");

    await page.click(page.saveButton());
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('creature_template-1.sql');
    await page.click(page.sessionButton());
    expect(session.entries()[0].label).toBe('creature_template 1');

    await page.click(page.backButton());
    expect(handlerService.select).toHaveBeenCalledWith(false, '1', 'Anub');
    session.clear();
    click.mockRestore();
  });
});
