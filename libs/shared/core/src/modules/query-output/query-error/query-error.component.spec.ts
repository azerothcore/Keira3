import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QueryErrorComponent } from './query-error.component';

describe('QueryErrorComponent', () => {
  let component: QueryErrorComponent;
  let fixture: ComponentFixture<QueryErrorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QueryErrorComponent],
    }).compileComponents();
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
