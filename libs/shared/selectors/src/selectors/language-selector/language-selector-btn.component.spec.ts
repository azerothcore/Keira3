import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LanguageSelectorBtnComponent } from './language-selector-btn.component';

describe('LanguageSelectorBtnComponent', () => {
  let component: LanguageSelectorBtnComponent;
  let fixture: ComponentFixture<LanguageSelectorBtnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), LanguageSelectorBtnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
