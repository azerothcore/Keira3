import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LootEditorModule } from '@keira/shared/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { FishingLootTemplateComponent } from './fishing-loot-template.component';
import { FishingLootTemplateService } from './fishing-loot-template.service';
import { SelectFishingLootComponent } from './select-fishing-loot.component';
import { SelectFishingLootService } from './select-fishing-loot.service';
import { TranslateModule } from '@ngx-translate/core';

const components = [FishingLootTemplateComponent, SelectFishingLootComponent];

@NgModule({
  exports: components,
  imports: [CommonModule, LootEditorModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, ...components],
  providers: [FishingLootTemplateService, SelectFishingLootService, FishingLootHandlerService],
})
export class FishingLootTemplateModule {}
