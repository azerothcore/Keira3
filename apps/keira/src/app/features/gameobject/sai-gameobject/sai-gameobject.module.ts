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
} from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SaiGameobjectEditorService } from './sai-gameobject-editor.service';
import { SaiGameobjectComponent } from './sai-gameobject.component';

@NgModule({
  declarations: [SaiGameobjectComponent],
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
  exports: [SaiGameobjectComponent],
  providers: [SaiGameobjectEditorService],
})
export class SaiGameobjectModule {}
