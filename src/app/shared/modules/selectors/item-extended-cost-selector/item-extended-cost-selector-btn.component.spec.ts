import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemExtendedCostSelectorBtnComponent } from './item-extended-cost-selector-btn.component';
import { ItemExtendedCostSelectorModule } from './item-extended-cost-selector.module';

describe('ItemExtendedCostSelectorBtnComponent', () => {
  let component: ItemExtendedCostSelectorBtnComponent;
  let fixture: ComponentFixture<ItemExtendedCostSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ItemExtendedCostSelectorModule ],
    })
    .compileComponents();
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
