import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HolidaySelectorBtnComponent } from './holiday-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('HolidaySelectorBtnComponent', () => {
  let component: HolidaySelectorBtnComponent;
  let fixture: ComponentFixture<HolidaySelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), HolidaySelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
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
