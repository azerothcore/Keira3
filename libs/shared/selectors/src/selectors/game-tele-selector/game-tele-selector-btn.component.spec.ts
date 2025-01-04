import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameTeleSelectorBtnComponent } from './game-tele-selector-btn.component';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('GameTeleSelectorBtnComponent', () => {
  let component: GameTeleSelectorBtnComponent;
  let fixture: ComponentFixture<GameTeleSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), GameTeleSelectorBtnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTeleSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
