import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ModalModule } from 'ngx-bootstrap/modal';
import { QuestFactionSelectorBtnComponent } from './quest-faction-selector-btn.component';
import { FactionSelectorBtnComponent } from './faction-selector-btn.component';

describe('QuestFactionSelectorBtnComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), FactionSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    const fixture: ComponentFixture<QuestFactionSelectorBtnComponent> = TestBed.createComponent(QuestFactionSelectorBtnComponent);
    const component: QuestFactionSelectorBtnComponent = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
