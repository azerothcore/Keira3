import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
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
  ],
  exports: [CreatureTemplateSpellComponent],
  providers: [CreatureTemplateSpellService],
})
export class CreatureTemplateSpellModule {}
