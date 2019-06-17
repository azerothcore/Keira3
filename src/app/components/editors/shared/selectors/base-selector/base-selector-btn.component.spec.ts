import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap';

import { BaseSelectorBtnComponent } from './base-selector-btn.component';
import { ItemSelectorBtnComponent } from '../item-selector/item-selector-btn.component';

describe('BaseSelectorBtnComponent', () => {
  let component: BaseSelectorBtnComponent;
  let fixture: ComponentFixture<BaseSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSelectorBtnComponent ],
      imports: [
        ModalModule.forRoot(),
      ]
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
