import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSelectorBtnComponent } from './item-selector-btn.component';
import { ItemSelectorModule } from './item-selector.module';

describe('ItemSelectorBtnComponent', () => {
  let component: ItemSelectorBtnComponent;
  let fixture: ComponentFixture<ItemSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ItemSelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
