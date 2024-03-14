import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SingleValueSelectorBtnComponent } from './single-value-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SingleValueSelectorBtnComponent', () => {
  let component: SingleValueSelectorBtnComponent;
  let fixture: ComponentFixture<SingleValueSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SingleValueSelectorBtnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleValueSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
