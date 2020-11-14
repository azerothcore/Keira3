import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestSelectorBtnComponent } from './quest-selector-btn.component';
import { QuestSelectorModule } from './quest-selector.module';

describe('QuestSelectorBtnComponent', () => {
  let component: QuestSelectorBtnComponent;
  let fixture: ComponentFixture<QuestSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ QuestSelectorModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
