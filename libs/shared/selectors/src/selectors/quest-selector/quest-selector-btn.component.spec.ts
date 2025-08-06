import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { QuestSelectorBtnComponent } from './quest-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('QuestSelectorBtnComponent', () => {
  let component: QuestSelectorBtnComponent;
  let fixture: ComponentFixture<QuestSelectorBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), QuestSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
