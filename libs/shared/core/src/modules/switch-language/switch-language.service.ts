import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class SwitchLanguageService {
  currentLanguage = 'en';

  constructor(private readonly translateService: TranslateService) {}

  setLanguage(event: any): void {
    this.currentLanguage = event.target.value;
    this.translateService.setDefaultLang(event.target.value);
  }
}
