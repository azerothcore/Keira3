import { NgModule } from '@angular/core';
import { provideTranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [TranslateDirective, TranslatePipe],
  exports: [TranslateDirective, TranslatePipe],
  providers: [provideTranslateService()],
})
export class TranslateTestingModule {}
