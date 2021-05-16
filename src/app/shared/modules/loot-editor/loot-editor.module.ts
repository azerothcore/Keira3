import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { ReferenceViewerComponent } from './reference-viewer.component';
import { ReferenceViewerService } from '@keira-shared/modules/loot-editor/reference-viewer.service';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { LootEditorComponent } from './loot-editor.component';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';

@NgModule({
  declarations: [ReferenceViewerComponent, LootEditorComponent],
  exports: [LootEditorComponent],
  imports: [
    CommonModule,
    NgxDatatableModule,
    IconModule,
    ToastrModule.forRoot(toastrConfig),
    TooltipModule.forRoot(),
    ReactiveFormsModule,
    ItemSelectorModule,
    FlagsSelectorModule,
    QueryOutputModule,
    EditorButtonsModule,
  ],
  providers: [ReferenceViewerService],
})
export class LootEditorModule {}
