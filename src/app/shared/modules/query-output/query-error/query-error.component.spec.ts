import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryErrorComponent } from './query-error.component';

describe('QueryErrorComponent', () => {
  let component: QueryErrorComponent;
  let fixture: ComponentFixture<QueryErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
