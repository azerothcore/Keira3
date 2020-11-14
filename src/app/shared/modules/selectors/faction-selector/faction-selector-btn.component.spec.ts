import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactionSelectorBtnComponent } from './faction-selector-btn.component';
import { FactionSelectorModule } from './faction-selector.module';

describe('FactionSelectorBtnComponent', () => {
  let component: FactionSelectorBtnComponent;
  let fixture: ComponentFixture<FactionSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ FactionSelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactionSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
