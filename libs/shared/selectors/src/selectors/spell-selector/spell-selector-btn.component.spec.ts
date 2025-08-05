import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { SpellSelectorBtnComponent } from './spell-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SpellSelectorBtnComponent', () => {
  let component: SpellSelectorBtnComponent;
  let fixture: ComponentFixture<SpellSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SpellSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpellSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
