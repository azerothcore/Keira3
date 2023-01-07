import { NgModule } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { TranslateService } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SwitchLanguageComponent } from './switch-language.component';
import { SwitchLanguageService } from './switch-language.service';

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
      providers: [SwitchLanguageService],
    }).compileComponents();
  }));

  function setup() {
    const translateService = TestBed.inject(TranslateService);
    const service = TestBed.get(SwitchLanguageService);

    return { translateService, service };
  }

  it('change the default language', () => {
    const { service, translateService } = setup();
    const spy = spyOn(translateService, 'setDefaultLang');
    const mockLang = 'it';
    const mockEvent = { target: { value: mockLang } };

    service.setLanguage(mockEvent);

    expect(spy).toHaveBeenCalledOnceWith(mockLang);
  });
});
