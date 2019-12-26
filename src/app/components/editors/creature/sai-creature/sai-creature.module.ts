import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../../config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { FlagsSelectorModule } from '../../shared/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '../../shared/selectors/single-value-selector/single-value-selector.module';
import { SaiCreatureComponent } from './sai-creature.component';
import { SaiEditorModule } from '../../shared/sai-editor/sai-editor.module';

@NgModule({
  declarations: [
    SaiCreatureComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(),
    NgxDatatableModule,
    FlagsSelectorModule,
    SingleValueSelectorModule,
    SaiEditorModule
  ],
  exports: [
    SaiCreatureComponent,
  ],
})
export class SaiCreatureModule {}
