import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LanguageSelectorBtnComponent } from './language-selector-btn.component';
import { LanguageSelectorModule } from './language-selector.module';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('LanguageSelectorBtnComponent', () => {
  let component: LanguageSelectorBtnComponent;
  let fixture: ComponentFixture<LanguageSelectorBtnComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ModalModule.forRoot(), LanguageSelectorModule],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageSelectorBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
