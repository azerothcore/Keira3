import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestPreviewComponent } from './quest-preview.component';
import { QuestPreviewService } from './quest-preview.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';



@NgModule({
  declarations: [QuestPreviewComponent],
  imports: [
    CommonModule,
    PerfectScrollbarModule
  ],
  providers: [QuestPreviewService],
  exports: [
    QuestPreviewComponent
  ]
})
export class QuestPreviewModule { }
