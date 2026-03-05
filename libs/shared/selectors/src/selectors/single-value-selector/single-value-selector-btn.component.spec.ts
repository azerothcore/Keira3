import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { SingleValueSelectorBtnComponent } from './single-value-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SingleValueSelectorBtnComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SingleValueSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(SingleValueSelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
