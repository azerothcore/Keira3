import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { LootEditorComponent } from './loot-editor.component';
import { ReferenceViewerComponent } from './reference-viewer.component';

import { ReferenceViewerService } from './reference-viewer.service';

@NgModule({
  exports: [LootEditorComponent],
  imports: [
    CommonModule,
    NgxDatatableModule,
    ToastrModule,
    TooltipModule,
    ReactiveFormsModule,
    TranslateModule,
    ReferenceViewerComponent,
    LootEditorComponent,
  ],
  providers: [ReferenceViewerService],
})
export class LootEditorModule {}
