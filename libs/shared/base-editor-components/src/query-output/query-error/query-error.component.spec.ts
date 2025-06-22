import { TestBed, waitForAsync } from '@angular/core/testing';
import { QueryErrorComponent } from './query-error.component';

describe('QueryErrorComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QueryErrorComponent],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(QueryErrorComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
