import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { CreatureSelectorBtnComponent } from './creature-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('CreatureSelectorBtnComponent', () => {
  let component: CreatureSelectorBtnComponent;
  let fixture: ComponentFixture<CreatureSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), CreatureSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatureSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
