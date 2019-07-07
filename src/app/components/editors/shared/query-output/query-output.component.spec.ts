import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';

import { QueryOutputComponent } from './query-output.component';
import { MockType } from '../../../../test-utils/mocks';
import { highlightOptions } from '../../../../config/highlight.config';
import { HighlightjsWrapperComponent } from '../hightlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from './query-error/query-error.component';

describe('QueryOutputComponent', () => {
  let component: QueryOutputComponent<MockType>;
  let fixture: ComponentFixture<QueryOutputComponent<MockType>>;

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
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
