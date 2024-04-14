import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  REFERENCE_LOOT_TEMPLATE_TABLE,
  ReferenceLootTemplate,
} from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SelectReferenceLootService } from './select-reference-loot.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../select-loot.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgIf,
    NgxDatatableModule,
  ],
})
export class SelectReferenceLootComponent extends SelectComponent<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectReferenceLootService,
    public readonly handlerService: ReferenceLootHandlerService,
  ) {
    super(REFERENCE_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
