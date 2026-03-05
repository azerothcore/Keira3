import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HolidaySelectorBtnComponent } from './holiday-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('HolidaySelectorBtnComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), HolidaySelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(HolidaySelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
