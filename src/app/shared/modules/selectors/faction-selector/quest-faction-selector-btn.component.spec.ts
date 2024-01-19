import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalModule } from 'ngx-bootstrap/modal';
import { FactionSelectorModule } from './faction-selector.module';
import { QuestFactionSelectorBtnComponent } from './quest-faction-selector-btn.component';

describe('FactionSelectorBtnComponent', () => {
  let component: QuestFactionSelectorBtnComponent;
  let fixture: ComponentFixture<QuestFactionSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), FactionSelectorModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestFactionSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
