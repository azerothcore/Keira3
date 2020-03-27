import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageSelectorBtnComponent } from './language-selector-btn.component';
import { LanguageSelectorModule } from './language-selector.module';

describe('LanguageSelectorBtnComponent', () => {
  let component: LanguageSelectorBtnComponent;
  let fixture: ComponentFixture<LanguageSelectorBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ LanguageSelectorModule ],
    })
    .compileComponents();
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
