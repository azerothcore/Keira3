import { Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { MockType, QueryOutputComponentPage, TranslateTestingModule } from '@keira/test-utils';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { EditorService } from '../../abstract/service/editors/editor.service';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryOutputComponent } from './query-output.component';
import { HighlightjsWrapperModule } from '../highlightjs-wrapper/highlightjs-wrapper.module';

@Component({
  template: `<keira-query-output [editorService]="editorService"></keira-query-output>`,
})
class TestHostComponent {
  @ViewChild(QueryOutputComponent) child: QueryOutputComponent<MockType>;
  docUrl: string;
  editorService: EditorService<any>;
}

describe('QueryOutputComponent', () => {
  const diffQuery = '--diffQuery';
  const fullQuery = '--fullQuery';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent, QueryOutputComponent, HighlightjsWrapperComponent, QueryErrorComponent],
      imports: [BrowserModule, FormsModule, HighlightjsWrapperModule, ModalModule.forRoot(), TranslateTestingModule],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const page = new QueryOutputComponentPage<TestHostComponent>(fixture);
    const host = fixture.componentInstance;

    host.editorService = {
      isNew: false,
      diffQuery,
      fullQuery,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      reloadSameEntity(_changeDetectorRef) {},
    } as EditorService<MockType>;

    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    const component = host.child;

    return { page, fixture, component, host };
  };

  it('toggle diff/full query should correctly work', () => {
    const { page } = setup();
    page.expectDiffQueryToBeShown();

    page.clickElement(page.fullQueryInput);
    page.expectFullQueryToBeShown();

    page.clickElement(page.diffQueryInput);
    page.expectDiffQueryToBeShown();
  });

  it('should always show the fullQuery when creating a new entity', () => {
    const { page, component, fixture } = setup();
    (component.editorService as any)['isNew'] = true;
    fixture.detectChanges();

    page.expectFullQueryToBeShown();
  });

  it('clicking the copy button should copy the correct query', () => {
    const { page } = setup();
    const spy = spyOn(TestBed.inject(ClipboardService), 'copyFromContent');

    page.clickElement(page.copyBtn);
    expect(spy).toHaveBeenCalledWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.copyBtn);
    expect(spy).toHaveBeenCalledWith(fullQuery);
  });

  it('clicking the execute button should emit the correct query', () => {
    const { page, component } = setup();
    const spy = spyOn(component.executeQuery, 'emit');

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(fullQuery);
  });

  describe('reload', () => {
    it('should not ask for confirmation if diffQuery is empty', fakeAsync(() => {
      const { page, host } = setup();
      (host.editorService as any).diffQuery = '';
      spyOn(host.editorService, 'reloadSameEntity');

      page.clickElement(page.reloadBtn);
      tick();

      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(1);
    }));

    it('should ask for confirmation if diffQuery is empty, and reset if confirmed', () => {
      const { page, host, component } = setup();
      (host.editorService as any).diffQuery = '-- some query';
      spyOn(host.editorService, 'reloadSameEntity');
      const modalService = TestBed.inject(BsModalService);
      spyOn(modalService, 'show').and.callThrough();

      page.clickElement(page.reloadBtn);
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(0);
      expect(modalService.show).toHaveBeenCalledTimes(1);

      component['modalRef'].content.onConfirm();
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(1);
    });

    it('should ask for confirmation if diffQuery is empty, and not reset if not confirmed', () => {
      const { page, host, component } = setup();
      (host.editorService as any).diffQuery = '-- some query';
      spyOn(host.editorService, 'reloadSameEntity');
      const modalService = TestBed.inject(BsModalService);
      spyOn(modalService, 'show').and.callThrough();

      page.clickElement(page.reloadBtn);
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(0);
      expect(modalService.show).toHaveBeenCalledTimes(1);

      component['modalRef'].content.onCancel();
      expect(host.editorService.reloadSameEntity).toHaveBeenCalledTimes(0);
    });

    // closeModalsAfterEach();
  });
});
