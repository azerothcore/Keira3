import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_IMMUNITIES_CUSTOM_STARTING_ID,
  CREATURE_IMMUNITIES_ID,
  CREATURE_IMMUNITIES_TABLE,
  CreatureImmunities,
} from '@keira/shared/acore-world-model';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureImmunitiesHandlerService } from '../creature-immunities-handler.service';
import { SelectCreatureImmunitiesService } from './select-creature-immunities.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-creature-immunities',
  templateUrl: './select-creature-immunities.component.html',
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
export class SelectCreatureImmunitiesComponent extends SelectComponent<CreatureImmunities> {
  protected override readonly entityTable = CREATURE_IMMUNITIES_TABLE;
  protected override readonly entityIdField = CREATURE_IMMUNITIES_ID;
  protected readonly customStartingId = CREATURE_IMMUNITIES_CUSTOM_STARTING_ID;
  protected readonly nextIdFrom: 'max' | 'min' = 'min';
  protected readonly selectService = inject(SelectCreatureImmunitiesService);
  readonly handlerService = inject(CreatureImmunitiesHandlerService);
}
