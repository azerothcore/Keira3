import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HolidaySelectorBtnComponent } from './holiday-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('HolidaySelectorBtnComponent', () => {
  let component: HolidaySelectorBtnComponent;
  let fixture: ComponentFixture<HolidaySelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), HolidaySelectorBtnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidaySelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
