import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ItemLimitCategorySelectorBtnComponent } from './item-limit-category-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ItemLimitCategorySelectorBtnComponent', () => {
  let component: ItemLimitCategorySelectorBtnComponent;
  let fixture: ComponentFixture<ItemLimitCategorySelectorBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ItemLimitCategorySelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemLimitCategorySelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
