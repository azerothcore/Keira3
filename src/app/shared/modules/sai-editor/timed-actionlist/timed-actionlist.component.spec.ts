import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimedActionlistComponent } from './timed-actionlist.component';

describe('TimedActionlistComponent', () => {
  let component: TimedActionlistComponent;
  let fixture: ComponentFixture<TimedActionlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimedActionlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimedActionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
