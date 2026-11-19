import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ItemDisplaySelectorBtnComponent } from './item-display-selector-btn.component';

describe('ItemDisplaySelectorBtnComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalDirective, ItemDisplaySelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(ItemDisplaySelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
