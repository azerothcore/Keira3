import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';

import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { ConditionsComponent } from './conditions.component';

@NgModule({
  declarations: [
    ConditionsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
  ],
  exports: [
    ConditionsComponent,
  ],
})
export class ConditionsEditorModule {}
