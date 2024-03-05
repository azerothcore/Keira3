import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ItemExtendedCostSelectorBtnComponent } from './item-extended-cost-selector-btn.component';
import { ItemExtendedCostSelectorModule } from './item-extended-cost-selector.module';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('ItemExtendedCostSelectorBtnComponent', () => {
  let component: ItemExtendedCostSelectorBtnComponent;
  let fixture: ComponentFixture<ItemExtendedCostSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), ItemExtendedCostSelectorModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemExtendedCostSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
