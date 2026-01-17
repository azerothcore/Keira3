import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { GameTeleSelectorBtnComponent } from './game-tele-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('GameTeleSelectorBtnComponent', () => {
  let component: GameTeleSelectorBtnComponent;
  let fixture: ComponentFixture<GameTeleSelectorBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), GameTeleSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTeleSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
