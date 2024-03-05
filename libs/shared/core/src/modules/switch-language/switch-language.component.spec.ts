import { TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SwitchLanguageComponent } from './switch-language.component';

describe('SwitchLanguageComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SwitchLanguageComponent],
      imports: [ModalModule.forRoot(), TranslateTestingModule],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(SwitchLanguageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  it('change the default language', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });
});
