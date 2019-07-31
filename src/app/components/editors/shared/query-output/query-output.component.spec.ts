import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';
import { ClipboardService } from 'ngx-clipboard';

import { QueryOutputComponent } from './query-output.component';
import { MockType } from '../../../../test-utils/mocks';
import { highlightOptions } from '../../../../config/highlight.config';
import { HighlightjsWrapperComponent } from '../hightlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { EditorService } from '../../../../services/editors/editor.service';
import { PageObject } from '../../../../test-utils/page-object';

export class QueryOutputComponentPage extends PageObject<QueryOutputComponent<MockType>> {
  get diffQueryWrapper() { return this.query<HTMLElement>('app-highlightjs-wrapper#diff-query'); }
  get fullQueryWrapper() { return this.query<HTMLElement>('app-highlightjs-wrapper#full-query'); }

  get diffQueryInput() { return this.query<HTMLInputElement>('#diff-query-input'); }
  get fullQueryInput() { return this.query<HTMLInputElement>('#full-query-input'); }

  get copyBtn() { return this.query<HTMLButtonElement>('#copy-btn'); }
  get executeBtn() { return this.query<HTMLButtonElement>('#execute-btn'); }

  expectDiffQueryToBeShown() {
    expect(this.isHidden(this.diffQueryWrapper)).toBe(
      false, 'Expected diff query wrapper NOT to be hidden'
    );
    expect(this.isHidden(this.fullQueryWrapper)).toBe(
      true, 'Expected full query wrapper to be Hidden'
    );
  }

  expectFullQueryToBeShown() {
    expect(this.isHidden(this.diffQueryWrapper)).toBe(
      true, 'Expected diff query wrapper to be hidden'
    );
    expect(this.isHidden(this.fullQueryWrapper)).toBe(
      false, 'Expected full query wrapper NOT to be hidden'
    );
  }
}

describe('QueryOutputComponent', () => {
  let component: QueryOutputComponent<MockType>;
  let fixture: ComponentFixture<QueryOutputComponent<MockType>>;
  let page: QueryOutputComponentPage;

  const diffQuery = '--diffQuery';
  const fullQuery = '--fullQuery';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        QueryOutputComponent,
        HighlightjsWrapperComponent,
        QueryErrorComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HighlightModule.forRoot(highlightOptions),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryOutputComponent);
    page = new QueryOutputComponentPage(fixture);
    component = fixture.componentInstance;

    component.editorService = {
      isNew: false,
      diffQuery,
      fullQuery,
      error: null,
    } as EditorService<MockType>;

    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('toggle diff/full query should correctly work', () => {
    page.expectDiffQueryToBeShown();

    page.clickElement(page.fullQueryInput);
    page.expectFullQueryToBeShown();

    page.clickElement(page.diffQueryInput);
    page.expectDiffQueryToBeShown();
  });

  it('should always show the fullQuery when creating a new entity', () => {
    (component.editorService as any)['isNew'] = true;
    fixture.detectChanges();

    page.expectFullQueryToBeShown();
  });

  it('clicking the copy button should copy the correct query', () => {
    const spy = spyOn(TestBed.get(ClipboardService), 'copyFromContent');

    page.clickElement(page.copyBtn);
    expect(spy).toHaveBeenCalledWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.copyBtn);
    expect(spy).toHaveBeenCalledWith(fullQuery);
  });

  it('clicking the execute button should emit the correct query', () => {
    const spy = spyOn(component.executeQuery, 'emit');

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(diffQuery);

    page.clickElement(page.fullQueryInput);

    page.clickElement(page.executeBtn);
    expect(spy).toHaveBeenCalledWith(fullQuery);
  });
});
