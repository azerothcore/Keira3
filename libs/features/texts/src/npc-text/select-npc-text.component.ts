import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { NpcText, NPC_TEXT_CUSTOM_STARTING_ID, NPC_TEXT_TABLE, NPC_TEXT_ID } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SelectNpcTextService } from './select-npc-text.service';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-npc-text.component.html',
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
    NgxDatatableModule,
  ],
})
export class SelectNpcTextComponent extends SelectComponent<NpcText> {
  readonly entityTable = NPC_TEXT_TABLE;
  readonly entityIdField = NPC_TEXT_ID;
  readonly customStartingId = NPC_TEXT_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectNpcTextService);
  readonly handlerService = inject(NpcTextHandlerService);
}
