import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';

import { ItemSelectorModalComponent } from '../item-selector/item-selector-modal.component';
import { BaseSelectorModalComponent } from './base-selector-modal.component';

describe('ItemSelectorModalComponent', () => {
  let component: BaseSelectorModalComponent;
  let fixture: ComponentFixture<ItemSelectorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSelectorModalComponent ],
      providers: [
        BsModalRef,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
