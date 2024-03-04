import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  EditorButtonsModule,
  FlagsSelectorModule,
  QueryOutputModule,
  SaiEditorModule,
  SingleValueSelectorModule,
  TopBarModule,
} from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SaiCreatureEditorService } from './sai-creature-editor.service';
import { SaiCreatureComponent } from './sai-creature.component';

@NgModule({
  declarations: [SaiCreatureComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    FlagsSelectorModule,
    SingleValueSelectorModule,
    SaiEditorModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  exports: [SaiCreatureComponent],
  providers: [SaiCreatureEditorService],
})
export class SaiCreatureModule {}
