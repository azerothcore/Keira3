import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { TranslateService } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SwitchLanguageService } from './switch-language.service';

describe('SwitchLanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalModule.forRoot(), TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), SwitchLanguageService],
    }).compileComponents();
  });

  function setup() {
    const translateService = TestBed.inject(TranslateService);
    const service = TestBed.inject(SwitchLanguageService);

    return { translateService, service };
  }

  it('change the default language', () => {
    const { service, translateService } = setup();
    const spy = spyOn(translateService, 'setFallbackLang');
    const mockLang = 'it';
    const mockEvent = { target: { value: mockLang } };

    // TODO: fix typing
    service.setLanguage(mockEvent as unknown as Event);

    expect(spy).toHaveBeenCalledOnceWith(mockLang);
  });
});
