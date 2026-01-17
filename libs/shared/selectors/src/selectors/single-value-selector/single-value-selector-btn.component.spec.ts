import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { SingleValueSelectorBtnComponent } from './single-value-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SingleValueSelectorBtnComponent', () => {
  let component: SingleValueSelectorBtnComponent;
  let fixture: ComponentFixture<SingleValueSelectorBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SingleValueSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleValueSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
