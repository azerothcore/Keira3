import { TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { TranslateService } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SwitchLanguageService } from './switch-language.service';

describe('SwitchLanguageService', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), TranslateTestingModule],
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
