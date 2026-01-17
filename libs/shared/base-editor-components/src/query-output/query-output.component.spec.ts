import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { EditorService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { QueryOutputComponentPage, TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
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
        ModalModule.forRoot(),
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const spy = spyOn(TestBed.inject(ClipboardService), 'copyFromContent');

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
    const spy = spyOn(component.executeQuery, 'emit');

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(fullQuery);
  });

  it('clicking the execute & copy button should copy and emit the correct query', () => {
    const { page, host } = setup();
    const copySpy = spyOn(TestBed.inject(ClipboardService), 'copyFromContent');
    page.detectChanges();
    const component = host.child();
    const executeSpy = spyOn(component.executeQuery, 'emit');

    page.clickElement(page.executeAndCopyBtn);
    expect(copySpy).toHaveBeenCalledOnceWith(diffQuery);
    expect(executeSpy).toHaveBeenCalledOnceWith(diffQuery);

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
      spyOn(host.editorService, 'reloadSameEntity');

      page.clickElement(page.reloadBtn);
      await tickAsync();

      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(1);
    });

    it('should ask for confirmation if diffQuery is empty, and reset if confirmed', () => {
      const { page, host } = setup();
      host.diffQuery = '-- some query';
      spyOn(host.editorService, 'reloadSameEntity');
      const modalService = TestBed.inject(BsModalService);
      spyOn(modalService, 'show').and.callThrough();
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
      spyOn(host.editorService, 'reloadSameEntity');
      const modalService = TestBed.inject(BsModalService);
      spyOn(modalService, 'show').and.callThrough();
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
});
