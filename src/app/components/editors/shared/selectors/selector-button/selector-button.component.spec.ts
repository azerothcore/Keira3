import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorButtonComponent } from './selector-button.component';

describe('SelectorButtonComponent', () => {
  let component: SelectorButtonComponent;
  let fixture: ComponentFixture<SelectorButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
