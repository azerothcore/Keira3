import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferenceViewerComponent } from './reference-viewer.component';
import { ReferenceViewerService } from '@keira-shared/modules/reference-viewer/reference-viewer.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IconModule } from '@keira-shared/modules/icon/icon.module';



@NgModule({
  declarations: [ReferenceViewerComponent],
  exports: [ReferenceViewerComponent],
  imports: [
    CommonModule,
    NgxDatatableModule,
    IconModule
  ],
  providers: [ReferenceViewerService],
})
export class ReferenceViewerModule { }
