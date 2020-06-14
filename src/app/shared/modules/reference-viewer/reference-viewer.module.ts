import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferenceViewerComponent } from './reference-viewer.component';
import { ReferenceViewerService } from '@keira-shared/modules/reference-viewer/reference-viewer.service';



@NgModule({
  declarations: [ReferenceViewerComponent],
  imports: [
    CommonModule
  ],
  providers: [ReferenceViewerService],
})
export class ReferenceViewerModule { }
