import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ItemLimitCategorySelectorBtnComponent } from './item-limit-category-selector-btn.component';
import { ItemLimitCategorySelectorModule } from './item-limit-category-selector.module';

describe('ItemLimitCategorySelectorBtnComponent', () => {
  let component: ItemLimitCategorySelectorBtnComponent;
  let fixture: ComponentFixture<ItemLimitCategorySelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ItemLimitCategorySelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemLimitCategorySelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
