import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  standalone: true,
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectNpcTextService,
    public readonly handlerService: NpcTextHandlerService,
  ) {
    super(NPC_TEXT_TABLE, NPC_TEXT_ID, NPC_TEXT_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
