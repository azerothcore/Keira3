import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { LootEditorComponent } from './loot-editor.component';
import { ReferenceViewerComponent } from './reference-viewer.component';
import { IconModule } from '../icon/icon.module';
import { ItemSelectorModule } from '../selectors/item-selector/item-selector.module';
import { FlagsSelectorModule } from '../selectors/flags-selector/flags-selector.module';
import { QueryOutputModule } from '../query-output/query-output.module';
import { EditorButtonsModule } from '../editor-buttons/editor-buttons.module';
import { ReferenceViewerService } from './reference-viewer.service';

@NgModule({
  declarations: [ReferenceViewerComponent, LootEditorComponent],
  exports: [LootEditorComponent],
  imports: [
    CommonModule,
    NgxDatatableModule,
    IconModule,
    ToastrModule,
    TooltipModule,
    ReactiveFormsModule,
    ItemSelectorModule,
    FlagsSelectorModule,
    QueryOutputModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  providers: [ReferenceViewerService],
})
export class LootEditorModule {}
