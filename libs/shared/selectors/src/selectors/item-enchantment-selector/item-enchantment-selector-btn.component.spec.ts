import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ItemEnchantmentSelectorBtnComponent } from './item-enchantment-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ItemEnchantmentSelectorBtnComponent', () => {
  let component: ItemEnchantmentSelectorBtnComponent;
  let fixture: ComponentFixture<ItemEnchantmentSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ItemEnchantmentSelectorBtnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemEnchantmentSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
