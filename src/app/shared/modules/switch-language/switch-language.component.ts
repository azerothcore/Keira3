import { Component, Input } from '@angular/core';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'keira3-switch-language',
  templateUrl: './switch-language.component.html',
  styleUrls: ['./switch-language.component.scss'],
})
export class SwitchLanguageComponent extends SubscriptionHandler {
  @Input() longVersion = true;

  constructor(private readonly translateService: TranslateService) {
    super();
  }

  setLanguage(event: any): void {
    this.translateService.setDefaultLang(event.target.value);
  }
}
