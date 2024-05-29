import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureOnkillReputation, FACTION_RANK } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import {
  BooleanOptionSelectorComponent,
  FactionSelectorBtnComponent,
  GenericOptionSelectorComponent,
  SingleValueSelectorBtnComponent,
} from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-onkill-reputation',
  templateUrl: './creature-onkill-reputation.component.html',
  styleUrls: ['./creature-onkill-reputation.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    FactionSelectorBtnComponent,
    SingleValueSelectorBtnComponent,
    TooltipModule,
    BooleanOptionSelectorComponent,
    GenericOptionSelectorComponent,
  ],
})
export class CreatureOnkillReputationComponent extends SingleRowEditorComponent<CreatureOnkillReputation> {
  readonly FACTION_RANK = FACTION_RANK;

  override readonly editorService = inject(CreatureOnkillReputationService);
  readonly handlerService = inject(CreatureHandlerService);
}
