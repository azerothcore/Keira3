import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ItemExtendedCostSelectorBtnComponent } from './item-extended-cost-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ItemExtendedCostSelectorBtnComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ItemExtendedCostSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(ItemExtendedCostSelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
