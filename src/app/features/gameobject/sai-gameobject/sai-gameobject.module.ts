import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { SaiGameobjectComponent } from './sai-gameobject.component';
import { SaiEditorModule } from '@keira-shared/modules/sai-editor/sai-editor.module';
import { SaiGameobjectEditorService } from './sai-gameobject-editor.service';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';

@NgModule({
  declarations: [
    SaiGameobjectComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
    FlagsSelectorModule,
    SingleValueSelectorModule,
    SaiEditorModule
  ],
  exports: [
    SaiGameobjectComponent,
  ],
  providers: [
    SaiGameobjectEditorService,
    SaiGameobjectHandlerService,
  ],
})
export class SaiGameobjectModule {}
