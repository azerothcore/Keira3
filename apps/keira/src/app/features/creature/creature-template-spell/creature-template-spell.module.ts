import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateSpellComponent } from './creature-template-spell.component';
import { CreatureTemplateSpellService } from './creature-template-spell.service';

@NgModule({
  declarations: [CreatureTemplateSpellComponent],
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
  exports: [CreatureTemplateSpellComponent],
  providers: [CreatureTemplateSpellService],
})
export class CreatureTemplateSpellModule {}
