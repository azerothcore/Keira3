import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { ReferenceViewerService } from '@keira-shared/modules/loot-editor/reference-viewer.service';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { LootEditorComponent } from './loot-editor.component';
import { ReferenceViewerComponent } from './reference-viewer.component';

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
