import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureTemplateResistanceComponent } from './creature-template-resistance.component';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';

@NgModule({
  declarations: [
    CreatureTemplateResistanceComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    SingleValueSelectorModule,
    NgxDatatableModule,
    EditorButtonsModule,
  ],
  exports: [
    CreatureTemplateResistanceComponent
  ],
  providers: [
    CreatureTemplateResistanceService,
  ],
})
export class CreatureTemplateResistanceModule {}
