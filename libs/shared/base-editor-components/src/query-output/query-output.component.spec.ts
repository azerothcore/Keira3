import { vi } from 'vitest';
import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { EditorService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { QueryOutputComponentPage, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryOutputComponent } from './query-output.component';
import { tickAsync } from 'ngx-page-object-model';

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
  });
});
