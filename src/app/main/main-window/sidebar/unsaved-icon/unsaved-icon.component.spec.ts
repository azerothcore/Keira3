import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnsavedIconComponent } from './unsaved-icon.component';

describe('UnsavedIconComponent', () => {
  let component: UnsavedIconComponent;
  let fixture: ComponentFixture<UnsavedIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnsavedIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnsavedIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
