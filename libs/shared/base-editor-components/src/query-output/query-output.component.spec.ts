import { vi } from 'vitest';
import { ChangeDetectorRef, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';

import { EditorService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { QueryOutputComponentPage, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryOutputComponent } from './query-output.component';
import { tickAsync } from 'ngx-page-object-model';
import { EditorSettingsService, SessionSqlService, SoapService } from '@keira/shared/common-services';
import { Subject } from 'rxjs';

describe('QueryOutputComponent', () => {
  const diffQuery = '--diffQuery';
  const fullQuery = '--fullQuery';

  @Component({
    template: `<keira-query-output
      [docUrl]="docUrl"
      [isNew]="isNew"
      [diffQuery]="diffQuery"
      [fullQuery]="fullQuery"
      [error]="error"
      [entityTable]="entityTable"
      [editorService]="editorService"
    />`,
    imports: [FormsModule, TranslateTestingModule, QueryOutputComponent],
  })
  class TestHostComponent {
    readonly child = viewChild.required(QueryOutputComponent);
    docUrl!: string;
    editorService!: EditorService<any>;
    isNew = false;
    diffQuery = diffQuery;
    fullQuery = fullQuery;
    error = null;
    entityTable = '';
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        HighlightjsWrapperComponent,
        ModalDirective,
        TranslateTestingModule,
        TestHostComponent,
        QueryOutputComponent,
        HighlightjsWrapperComponent,
        QueryErrorComponent,
      ],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const page = new QueryOutputComponentPage<TestHostComponent>(fixture);
    const host = fixture.componentInstance;

    host.editorService = {
      reloadSameEntity(_changeDetectorRef: any) {},
    } as unknown as EditorService<TableRow>;

    // fixture.detectChanges();
    // const component = host.child();

    return { page, fixture, host };
  };

  it('toggle diff/full query should correctly work', () => {
    const { page } = setup();
    page.detectChanges();
    page.expectDiffQueryToBeShown();

    page.clickElement(page.fullQueryInput);
    page.expectFullQueryToBeShown();

    page.clickElement(page.diffQueryInput);
    page.expectDiffQueryToBeShown();
  });

  it('should always show the fullQuery when creating a new entity', () => {
    const { page, host } = setup();
    host.isNew = true;

    page.detectChanges();

    page.expectFullQueryToBeShown();
  });

  it('clicking the copy button should copy the correct query', () => {
    const { page } = setup();
    page.detectChanges();
    const spy = vi.spyOn(TestBed.inject(ClipboardService), 'copyFromContent').mockImplementation(() => undefined);

    page.clickElement(page.copyBtn);
    expect(spy).toHaveBeenCalledWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.copyBtn);
    expect(spy).toHaveBeenCalledWith(fullQuery);
  });

  it('clicking the execute button should emit the correct query', () => {
    const { page, host } = setup();
    page.detectChanges();
    const component = host.child();
    const spy = vi.spyOn(component.executeQuery, 'emit').mockImplementation(() => undefined);

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(fullQuery);
  });

  it('clicking the execute & copy button should copy and emit the correct query', () => {
    const { page, host } = setup();
    const copySpy = vi.spyOn(TestBed.inject(ClipboardService), 'copyFromContent').mockImplementation(() => undefined);
    page.detectChanges();
    const component = host.child();
    const executeSpy = vi.spyOn(component.executeQuery, 'emit').mockImplementation(() => undefined);

    page.clickElement(page.executeAndCopyBtn);
    expect(copySpy).toHaveBeenCalledExactlyOnceWith(diffQuery);
    expect(executeSpy).toHaveBeenCalledExactlyOnceWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.executeAndCopyBtn);
    expect(copySpy).toHaveBeenCalledWith(fullQuery);
    expect(executeSpy).toHaveBeenCalledWith(fullQuery);
  });

  it('execute & copy copies only once the query ran (or always, when set so)', () => {
    const { page, host } = setup();
    const saved = new Subject<boolean>();
    host.editorService = { saved, reloadSameEntity() {} } as unknown as EditorService<TableRow>;
    const copySpy = vi.spyOn(TestBed.inject(ClipboardService), 'copyFromContent').mockImplementation(() => undefined);
    page.detectChanges();
    vi.spyOn(host.child().executeQuery, 'emit').mockImplementation(() => undefined);
    page.clickElement(page.executeAndCopyBtn);
    expect(copySpy).not.toHaveBeenCalled();
    saved.next(false);
    expect(copySpy).not.toHaveBeenCalled();
    page.detectChanges();
    expect(page.query('#copy-note').textContent).toContain('QUERY_OUTPUT.NOT_COPIED');
    page.clickElement(page.executeAndCopyBtn);
    expect(page.query('#copy-note', false)).toBeFalsy();
    saved.next(true);
    expect(copySpy).toHaveBeenCalledExactlyOnceWith(diffQuery);
    page.detectChanges();
    expect(page.query('#copy-note').textContent).toContain('QUERY_OUTPUT.COPIED');
    // set to always copy
    TestBed.inject(EditorSettingsService).save({ copyOnlyOnSuccess: false });
    page.clickElement(page.executeAndCopyBtn);
    expect(copySpy).toHaveBeenCalledTimes(2);
    TestBed.inject(EditorSettingsService).save({ copyOnlyOnSuccess: true });
    // nothing to execute: nothing is waited for (a later query isn't copied in its place)
    Object.assign(host.child(), { getQuery: () => '' });
    const emit = vi.mocked(host.child().executeQuery.emit);
    emit.mockClear();
    page.clickElement(page.executeAndCopyBtn);
    saved.next(true);
    expect(copySpy).toHaveBeenCalledTimes(2);
    expect(emit).not.toHaveBeenCalled();
  });

  it('puts the query aside in the session SQL (#1086)', () => {
    localStorage.clear();
    const { page, host } = setup();
    host.editorService = { loadedEntityId: '1234', reloadSameEntity() {} } as unknown as EditorService<TableRow>;
    host.entityTable = 'creature_template';
    page.detectChanges();

    page.clickElement(page.query<HTMLButtonElement>('#add-to-session-btn'));

    const session = TestBed.inject(SessionSqlService);
    expect(session.entries()).toEqual([expect.objectContaining({ label: 'creature_template 1234', query: diffQuery })]);
    expect(page.query('#add-to-session-btn').textContent).toContain('SESSION_SQL.ADDED');
    // nothing to add
    Object.assign(host.child(), { getQuery: () => '' });
    page.clickElement(page.query<HTMLButtonElement>('#add-to-session-btn'));
    expect(session.entries().length).toBe(1);
    session.clear();
  });

  describe('getQuery', () => {
    it('get fullQuery based on editorService isNew', () => {
      const { page, host } = setup();
      host.isNew = true;
      page.detectChanges();
      const component = host.child();

      const query = component.getQuery();

      expect(query).toBe(component.fullQuery());
    });

    it('get fullQuery based on selectedQuery', () => {
      const { page, host } = setup();
      page.detectChanges();
      const component = host.child();
      component.selectedQuery.set('full');

      const query = component.getQuery();

      expect(query).toBe(component.fullQuery());
    });

    it('get diffQuery  based on selectedQuery', () => {
      const { page, host } = setup();
      page.detectChanges();
      const component = host.child();
      component.selectedQuery.set('diff');

      const query = component.getQuery();

      expect(query).toBe(component.diffQuery());
    });
  });

  describe('reload', () => {
    it('should not ask for confirmation if diffQuery is empty', async () => {
      const { page, host } = setup();
      host.diffQuery = '';
      page.detectChanges();
      vi.spyOn(host.editorService, 'reloadSameEntity').mockImplementation(() => undefined);

      page.clickElement(page.reloadBtn);
      await tickAsync();

      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(1);
    });

    it('should ask for confirmation if diffQuery is empty, and reset if confirmed', () => {
      const { page, host } = setup();
      host.diffQuery = '-- some query';
      vi.spyOn(host.editorService, 'reloadSameEntity').mockImplementation(() => undefined);
      const modalService = TestBed.inject(BsModalService);
      vi.spyOn(modalService, 'show');
      page.detectChanges();
      const component = host.child();

      page.clickElement(page.reloadBtn);
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(0);
      expect(modalService.show).toHaveBeenCalledTimes(1);

      component['modalRef'].content.onConfirm();
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(1);
    });

    it('should ask for confirmation if diffQuery is empty, and not reset if not confirmed', () => {
      const { page, host } = setup();
      host.diffQuery = '-- some query';
      vi.spyOn(host.editorService, 'reloadSameEntity').mockImplementation(() => undefined);
      const modalService = TestBed.inject(BsModalService);
      vi.spyOn(modalService, 'show');
      page.detectChanges();
      const component = host.child();

      page.clickElement(page.reloadBtn);
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(0);
      expect(modalService.show).toHaveBeenCalledTimes(1);

      component['modalRef'].content.onCancel();
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(0);
    });

    // closeModalsAfterEach();
  });

  describe('comparing two entities', () => {
    @Component({
      template: `<keira-query-output
        [isNew]="false"
        diffQuery=""
        fullQuery=""
        [error]="null!"
        [entityTable]="table()"
        [editorService]="service()"
      />`,
      imports: [TranslateTestingModule, QueryOutputComponent],
    })
    class CompareHostComponent {
      readonly table = signal('');
      readonly service = signal<EditorService<TableRow>>({} as EditorService<TableRow>);
    }
    const setupCompare = () => {
      const fixture = TestBed.createComponent(CompareHostComponent);
      const page = new QueryOutputComponentPage<CompareHostComponent>(fixture);
      const host = {
        set entityTable(table: string) {
          fixture.componentInstance.table.set(table);
        },
        set editorService(service: EditorService<TableRow>) {
          fixture.componentInstance.service.set(service);
        },
      };
      return { page, host };
    };
    const single = (id: string, row: TableRow) =>
      ({ loadedEntityId: id, form: { getRawValue: () => row }, reloadSameEntity() {} }) as unknown as EditorService<TableRow>;
    const multi = (id: string, rows: TableRow[]) =>
      ({ loadedEntityId: id, newRows: rows, entitySecondIdField: 'item', reloadSameEntity() {} }) as unknown as EditorService<TableRow>;
    const el = (page: { query<T extends HTMLElement>(s: string, a?: boolean): T }, selector: string) =>
      page.query<HTMLElement>(selector, false);

    it('pins an entity, then shows how another of the same table differs from it', () => {
      const { page, host } = setupCompare();
      host.entityTable = 'creature_template';
      host.editorService = single('1', { entry: 1, name: 'A', minlevel: 5 });
      page.detectChanges();
      expect(el(page, '#compare-btn')).toBeFalsy();
      page.clickElement(page.query('#compare-pin-btn'));
      expect(page.query('#compare-pin-btn').textContent).toContain('COMPARE.UNPIN');
      expect(el(page, '#compare-btn')).toBeFalsy();
      // another creature: what differs
      host.editorService = single('2', { entry: 2, name: 'B', minlevel: 5 });
      page.detectChanges();
      page.clickElement(page.query('#compare-btn'));
      expect(page.query('#compare-table').textContent).toContain('name');
      expect(page.query('#compare-table').textContent).not.toContain('minlevel');
      page.clickElement(page.query('#compare-btn'));
      expect(el(page, '#compare-panel')).toBeFalsy();
      // the same values: nothing differs
      host.editorService = single('3', { entry: 3, name: 'A', minlevel: 5 });
      page.detectChanges();
      page.clickElement(page.query('#compare-btn'));
      expect(el(page, '#compare-same')).toBeTruthy();
      // another table: nothing to compare with; pinning there replaces the pin
      host.entityTable = 'item_template';
      page.detectChanges();
      expect(el(page, '#compare-btn')).toBeFalsy();
      page.clickElement(page.query('#compare-pin-btn'));
      host.entityTable = 'creature_template';
      page.detectChanges();
      expect(el(page, '#compare-btn')).toBeFalsy();
    });

    it('matches the rows of multi-row editors, and unpins', () => {
      const { page, host } = setupCompare();
      host.entityTable = 'npc_vendor';
      host.editorService = multi('1', [
        { entry: 1, item: 10, maxcount: 0 },
        { entry: 1, item: 11, maxcount: 0 },
      ]);
      page.detectChanges();
      page.clickElement(page.query('#compare-pin-btn'));
      host.editorService = multi('2', [
        { entry: 2, item: 10, maxcount: 5 },
        { entry: 2, item: 12, maxcount: 0 },
      ]);
      page.detectChanges();
      page.clickElement(page.query('#compare-btn'));
      expect(page.query('#compare-table').textContent).toContain('maxcount');
      expect(page.query('#compare-only-pinned').textContent).toContain('11');
      expect(page.query('#compare-only-current').textContent).toContain('12');
      // only pinned rows, or only current ones
      host.editorService = multi('3', [{ entry: 3, item: 10, maxcount: 0 }]);
      page.detectChanges();
      expect(el(page, '#compare-only-current')).toBeFalsy();
      host.editorService = multi('1', [
        { entry: 1, item: 10, maxcount: 0 },
        { entry: 1, item: 11, maxcount: 0 },
      ]);
      page.detectChanges();
      page.clickElement(page.query('#compare-pin-btn'));
      expect(page.query('#compare-pin-btn').textContent).toContain('COMPARE.PIN');
    });

    it('matches the rows by both keys in editors that have two', () => {
      const { page, host } = setupCompare();
      const texts = (id: string, text: string) =>
        ({
          loadedEntityId: id,
          newRows: [0, 1].map((ID) => ({ CreatureID: Number(id), GroupID: 0, ID, Text: ID ? text : 'same' })),
          entitySecondIdField: 'GroupID',
          entityExtraIdField: 'ID',
          reloadSameEntity() {},
        }) as unknown as EditorService<TableRow>;
      host.entityTable = 'creature_text';
      host.editorService = texts('1', 'A');
      page.detectChanges();
      page.clickElement(page.query('#compare-pin-btn'));
      host.editorService = texts('2', 'B');
      page.detectChanges();
      page.clickElement(page.query('#compare-btn'));
      expect(page.query('#compare-table').textContent).toContain('0_1');
    });
  });

  describe('telling the worldserver', () => {
    it("offers the table's .reload when SOAP is on, and shows the server's answer", async () => {
      TestBed.overrideProvider(SoapService, {
        useValue: { available: () => true, execute: vi.fn().mockResolvedValueOnce('').mockRejectedValueOnce(new Error('no account')) },
      });
      const { page, host, fixture } = setup();
      host.entityTable = 'creature_text';
      host.editorService = { loadedEntityId: '1', reloadSameEntity() {} } as unknown as EditorService<TableRow>;
      page.detectChanges();
      const button = page.query<HTMLButtonElement>('#reload-server-btn');
      expect(button.textContent).toContain('.reload creature_text');
      button.click();
      await new Promise((resolve) => setTimeout(resolve));
      page.detectChanges();
      expect(page.query('#reload-server-answer').textContent).toContain('reload creature_text');
      button.click();
      await new Promise((resolve) => setTimeout(resolve));
      page.detectChanges();
      expect(page.query('#reload-server-answer').classList).toContain('text-danger');
      // another entity open: the answer was for the one before
      (host.editorService as { loadedEntityId: string }).loadedEntityId = '2';
      fixture.debugElement.query(By.directive(QueryOutputComponent)).injector.get(ChangeDetectorRef).markForCheck();
      page.detectChanges();
      expect(page.query('#reload-server-answer', false)).toBeFalsy();
    });

    it('offers nothing without SOAP', () => {
      const { page, host } = setup();
      host.entityTable = 'creature_text';
      page.detectChanges();
      expect(page.query('#reload-server-btn', false)).toBeFalsy();
    });
  });
});
