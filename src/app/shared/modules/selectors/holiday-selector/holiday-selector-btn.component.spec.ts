import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HolidaySelectorBtnComponent } from './holiday-selector-btn.component';
import { HolidaySelectorModule } from './holiday-selector.module';

describe('HolidaySelectorBtnComponent', () => {
  let component: HolidaySelectorBtnComponent;
  let fixture: ComponentFixture<HolidaySelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ HolidaySelectorModule ],
    })
    .compileComponents();
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
