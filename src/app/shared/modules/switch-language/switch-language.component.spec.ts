import { NgModule } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { TranslateService } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SwitchLanguageComponent } from './switch-language.component';

@NgModule({
  declarations: [ModalConfirmComponent],
  imports: [],
})
class TestModule {}

describe('SwitchLanguageComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SwitchLanguageComponent],
      imports: [ModalModule.forRoot(), TestModule, TranslateTestingModule],
    }).compileComponents();
  }));

  function setup() {
    const fixture = TestBed.createComponent(SwitchLanguageComponent);
    const component = fixture.componentInstance;
    const translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();

    return { fixture, component, translateService };
  }

  it('change the default language', () => {
    const { component, translateService } = setup();
    const spy = spyOn(translateService, 'setDefaultLang');
    const mockLang = 'it';
    const mockEvent = { target: { value: mockLang } };

    component.setLanguage(mockEvent);

    expect(spy).toHaveBeenCalledOnceWith(mockLang);
  });
});
