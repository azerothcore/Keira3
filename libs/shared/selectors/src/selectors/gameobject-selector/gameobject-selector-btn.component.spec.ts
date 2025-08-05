import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { GameobjectSelectorBtnComponent } from './gameobject-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('GameobjectSelectorBtnComponent', () => {
  let component: GameobjectSelectorBtnComponent;
  let fixture: ComponentFixture<GameobjectSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), GameobjectSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameobjectSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
