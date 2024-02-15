import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { ConditionsComponent } from './conditions.component';
import { ConditionsService } from './conditions.service';

@NgModule({
  declarations: [ConditionsComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    FlagsSelectorModule,
    SingleValueSelectorModule,
    TranslateModule,
  ],
  exports: [ConditionsComponent],
  providers: [ConditionsService],
})
export class ConditionsEditorModule {}
