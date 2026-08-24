import { inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Service()
export class SwitchLanguageService {
  currentLanguage = 'en';

  private readonly translateService: TranslateService = inject(TranslateService);

  setLanguage(event: Event): void {
    this.currentLanguage = (event.target as HTMLSelectElement).value;
    this.translateService.setFallbackLang((event.target as HTMLSelectElement).value);
  }
}
