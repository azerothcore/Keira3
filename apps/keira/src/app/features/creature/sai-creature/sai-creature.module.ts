import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SaiEditorModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SaiCreatureEditorService } from './sai-creature-editor.service';
import { SaiCreatureComponent } from './sai-creature.component';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    SaiEditorModule,
    TranslateModule,
    SaiCreatureComponent,
  ],
  exports: [SaiCreatureComponent],
  providers: [SaiCreatureEditorService],
})
export class SaiCreatureModule {}
