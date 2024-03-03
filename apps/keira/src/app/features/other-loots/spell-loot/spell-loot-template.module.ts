import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateModule, HighlightjsWrapperModule, LootEditorModule, TopBarModule } from '@keira/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectSpellLootComponent } from './select-spell-loot.component';
import { SelectSpellLootService } from './select-spell-loot.service';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { SpellLootTemplateComponent } from './spell-loot-template.component';
import { SpellLootTemplateService } from './spell-loot-template.service';
import { TranslateModule } from '@ngx-translate/core';

const components = [SpellLootTemplateComponent, SelectSpellLootComponent];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    CommonModule,
    TopBarModule,
    LootEditorModule,
    CreateModule,
    ReactiveFormsModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    TranslateModule,
  ],
  providers: [SpellLootTemplateService, SelectSpellLootService, SpellLootHandlerService],
})
export class SpellLootTemplateModule {}
