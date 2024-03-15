import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  CREATURE_TEMPLATE_CUSTOM_STARTING_ID,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate,
} from '@keira/shared/acore-world-model';
import { SelectCreatureService } from './select-creature.service';
import { CreatureHandlerService } from '../creature-handler.service';
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
  templateUrl: './select-creature.component.html',
  styleUrls: ['./select-creature.component.scss'],
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
export class SelectCreatureComponent extends SelectComponent<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectCreatureService,
    public handlerService: CreatureHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(CREATURE_TEMPLATE_TABLE, CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}
