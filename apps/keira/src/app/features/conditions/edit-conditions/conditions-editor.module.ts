import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FlagsSelectorModule, QueryOutputModule, SingleValueSelectorModule } from '@keira/shared/core';
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
