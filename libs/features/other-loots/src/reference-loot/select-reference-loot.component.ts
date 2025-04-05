import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  REFERENCE_LOOT_TEMPLATE_TABLE,
  ReferenceLootTemplate,
} from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SelectReferenceLootService } from './select-reference-loot.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../select-loot.component.html',
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
  ],
})
export class SelectReferenceLootComponent extends SelectComponent<ReferenceLootTemplate> {
  readonly entityTable = REFERENCE_LOOT_TEMPLATE_TABLE;
  readonly entityIdField = LOOT_TEMPLATE_ID;
  readonly customStartingId = REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectReferenceLootService);
  readonly handlerService = inject(ReferenceLootHandlerService);
}
