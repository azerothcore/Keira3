import { TestBed, waitForAsync } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LanguageSelectorBtnComponent } from './language-selector-btn.component';

describe('LanguageSelectorBtnComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), LanguageSelectorBtnComponent],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(LanguageSelectorBtnComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
