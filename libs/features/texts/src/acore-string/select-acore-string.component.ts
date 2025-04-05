import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { ACORE_STRING_CUSTOM_STARTING_ID, ACORE_STRING_ENTRY, ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectAcoreStringService } from './select-acore-string.service';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-acore-string.component.html',
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    TopBarComponent,
    CreateComponent,
    HighlightjsWrapperComponent,
  ],
})
export class SelectAcoreStringComponent extends SelectComponent<AcoreString> {
  readonly entityTable = ACORE_STRING_TABLE;
  readonly entityIdField = ACORE_STRING_ENTRY;
  readonly customStartingId = ACORE_STRING_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectAcoreStringService);
  readonly handlerService = inject(AcoreStringHandlerService);
}
