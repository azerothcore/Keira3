import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { MoneySelectorBtnComponent } from './money-selector-btn.component';

describe('MoneySelectorBtnComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalDirective, MoneySelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MoneySelectorBtnComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
