import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestPreviewComponent } from './quest-preview.component';
import { QuestPreviewService } from './quest-preview.service';



@NgModule({
  declarations: [QuestPreviewComponent],
  imports: [
    CommonModule
  ],
  providers: [QuestPreviewService],
})
export class QuestPreviewModule { }
