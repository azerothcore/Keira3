import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AREATRIGGER_TELEPORT_CUSTOM_STARTING_ID,
  AREATRIGGER_TELEPORT_ID,
  AREATRIGGER_TELEPORT_TABLE,
  AreatriggerTeleport,
} from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';
import { SelectAreaTriggerService } from './select-area-trigger.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-area-trigger',
  templateUrl: './select-area-trigger.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateDirective,
    TranslatePipe,
    NgxDatatableModule,
    CreateComponent,
    HighlightjsWrapperComponent,
    TopBarComponent,
  ],
})
export class SelectAreaTriggerComponent extends SelectComponent<AreatriggerTeleport> {
  protected override readonly entityTable = AREATRIGGER_TELEPORT_TABLE;
  protected override readonly entityIdField = AREATRIGGER_TELEPORT_ID;
  readonly customStartingId = AREATRIGGER_TELEPORT_CUSTOM_STARTING_ID;
  protected readonly selectService = inject(SelectAreaTriggerService);
  readonly handlerService = inject(AreaTriggerHandlerService);
}
