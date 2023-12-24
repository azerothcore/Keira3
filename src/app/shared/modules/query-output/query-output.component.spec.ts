import { Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { EditorService } from '../../abstract/service/editors/editor.service';
import { MockType } from '../../testing/mocks';
import { PageObject } from '../../testing/page-object';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryOutputComponent } from './query-output.component';

@Component({
  template: `<keira-query-output [editorService]="editorService"></keira-query-output>`,
})
class TestHostComponent {
  @ViewChild(QueryOutputComponent) child: QueryOutputComponent<MockType>;
  docUrl: string;
  editorService: EditorService<any>;
}

export class QueryOutputComponentPage extends PageObject<TestHostComponent> {
  get diffQueryWrapper(): HTMLElement {
    return this.query<HTMLElement>('keira-highlightjs-wrapper#diff-query');
  }
  get fullQueryWrapper(): HTMLElement {
    return this.query<HTMLElement>('keira-highlightjs-wrapper#full-query');
  }

  get diffQueryInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#diff-query-input');
  }
  get fullQueryInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#full-query-input');
  }

  get copyBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#copy-btn');
  }
  get executeBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#execute-btn');
  }
  get reloadBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#reload-btn');
  }

  expectDiffQueryToBeShown() {
    expect(this.isHidden(this.diffQueryWrapper)).toBe(false, 'Expected diff query wrapper NOT to be hidden');
    expect(this.isHidden(this.fullQueryWrapper)).toBe(true, 'Expected full query wrapper to be Hidden');
  }

  expectFullQueryToBeShown() {
    expect(this.isHidden(this.diffQueryWrapper)).toBe(true, 'Expected diff query wrapper to be hidden');
    expect(this.isHidden(this.fullQueryWrapper)).toBe(false, 'Expected full query wrapper NOT to be hidden');
  }
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
    const page = new QueryOutputComponentPage(fixture);
    const host = fixture.componentInstance;

    host.editorService = {
      isNew: false,
      diffQuery,
      fullQuery,
      error: null,
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
