import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SoundEntriesSelectorBtnComponent } from './sound-entries-selector-btn.component';

describe('SoundEntriesSelectorBtnComponent', () => {
  let component: SoundEntriesSelectorBtnComponent;
  let fixture: ComponentFixture<SoundEntriesSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SoundEntriesSelectorBtnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundEntriesSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
