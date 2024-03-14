import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalModule } from 'ngx-bootstrap/modal';
import { QuestFactionSelectorBtnComponent } from './quest-faction-selector-btn.component';
import { FactionSelectorBtnComponent } from './faction-selector-btn.component';

describe('QuestFactionSelectorBtnComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), FactionSelectorBtnComponent],
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
