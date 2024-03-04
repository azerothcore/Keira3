import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateResistanceComponent } from './creature-template-resistance.component';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';

@NgModule({
  declarations: [CreatureTemplateResistanceComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    NgxDatatableModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  exports: [CreatureTemplateResistanceComponent],
  providers: [CreatureTemplateResistanceService],
})
export class CreatureTemplateResistanceModule {}
