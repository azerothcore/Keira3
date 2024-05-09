import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_TEMPLATE_CUSTOM_STARTING_ID,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate,
} from '@keira/shared/acore-world-model';
import { SelectCreatureService } from './select-creature.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    NgxDatatableModule,
  ],
})
export class SelectCreatureComponent extends SelectComponent<CreatureTemplate> {
  readonly entityTable = CREATURE_TEMPLATE_TABLE;
  readonly entityIdField = CREATURE_TEMPLATE_ID;
  readonly customStartingId = CREATURE_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectCreatureService);
  readonly handlerService = inject(CreatureHandlerService);
}
