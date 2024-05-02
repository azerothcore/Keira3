import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  FISHING_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  FISHING_LOOT_TEMPLATE_TABLE,
  FishingLootTemplate,
  LOOT_TEMPLATE_ID,
} from '@keira/shared/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { SelectFishingLootService } from './select-fishing-loot.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

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
    NgxDatatableModule,
  ],
})
export class SelectFishingLootComponent extends SelectComponent<FishingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectFishingLootService,
    public readonly handlerService: FishingLootHandlerService,
  ) {
    super(FISHING_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, FISHING_LOOT_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
