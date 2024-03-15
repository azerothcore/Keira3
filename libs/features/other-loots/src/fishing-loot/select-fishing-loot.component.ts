import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira/shared/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  FISHING_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  FISHING_LOOT_TEMPLATE_TABLE,
  FishingLootTemplate,
  LOOT_TEMPLATE_ID,
} from '@keira/shared/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { SelectFishingLootService } from './select-fishing-loot.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from '@keira/shared/base-editor-components';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-creature',
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
export class SelectFishingLootComponent extends SelectComponent<FishingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectFishingLootService,
    public handlerService: FishingLootHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(
      FISHING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      FISHING_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
