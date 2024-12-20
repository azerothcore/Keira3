import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { ACORE_STRING_CUSTOM_STARTING_ID, ACORE_STRING_ENTRY, ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SelectAcoreTextService } from './select-acore-text.service';
import { AcoreTextHandlerService } from './acore-text-handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-acore-text.component.html',
  standalone: true,
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
export class SelectAcoreTextComponent extends SelectComponent<AcoreString> {
  readonly entityTable = ACORE_STRING_TABLE;
  readonly entityIdField = ACORE_STRING_ENTRY;
  readonly customStartingId = ACORE_STRING_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectAcoreTextService);
  readonly handlerService = inject(AcoreTextHandlerService);
}
