import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { QueryOutputComponent } from './query-output.component';
import { MockType } from '../../../test-utils/mocks';

describe('QueryOutputComponent', () => {
  let component: QueryOutputComponent<MockType>;
  let fixture: ComponentFixture<QueryOutputComponent<MockType>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        QueryOutputComponent,
      ],
      imports: [
        BrowserModule,
        FormsModule,
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
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
