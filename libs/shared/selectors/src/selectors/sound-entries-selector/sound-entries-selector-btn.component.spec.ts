import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SoundEntriesSelectorBtnComponent } from './sound-entries-selector-btn.component';

describe('SoundEntriesSelectorBtnComponent', () => {
  let component: SoundEntriesSelectorBtnComponent;
  let fixture: ComponentFixture<SoundEntriesSelectorBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), SoundEntriesSelectorBtnComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundEntriesSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
