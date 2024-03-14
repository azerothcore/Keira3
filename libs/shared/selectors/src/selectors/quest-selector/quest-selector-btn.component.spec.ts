import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestSelectorBtnComponent } from './quest-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('QuestSelectorBtnComponent', () => {
  let component: QuestSelectorBtnComponent;
  let fixture: ComponentFixture<QuestSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), QuestSelectorBtnComponent],
    }).compileComponents();
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
