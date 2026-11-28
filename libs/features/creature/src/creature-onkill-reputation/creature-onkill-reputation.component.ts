import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureOnkillReputation, FACTION_RANK } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { BooleanOptionSelectorComponent, GenericOptionSelectorComponent, QuestFactionSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { nameFromControl } from '../utils/name-from-control';
import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';

@Component({
  selector: 'keira-creature-onkill-reputation',
  templateUrl: './creature-onkill-reputation.component.html',
  styleUrls: ['./creature-onkill-reputation.component.scss'],
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    QuestFactionSelectorBtnComponent,
    TooltipDirective,
    BooleanOptionSelectorComponent,
    GenericOptionSelectorComponent,
    AsyncPipe,
  ],
})
export class CreatureOnkillReputationComponent extends SingleRowEditorComponent<CreatureOnkillReputation> {
  readonly FACTION_RANK = FACTION_RANK;

  protected override readonly editorService = inject(CreatureOnkillReputationService);
  readonly handlerService = inject(CreatureHandlerService);
  private readonly sqliteQueryService = inject(SqliteQueryService);

  // RewOnKillRepFaction1/2 are Faction.dbc ids, not FactionTemplate.dbc ids
  protected readonly faction1Name$ = nameFromControl(this.editorService.form.controls.RewOnKillRepFaction1, (id) =>
    this.sqliteQueryService.getFactionNameByNameId(id),
  );
  protected readonly faction2Name$ = nameFromControl(this.editorService.form.controls.RewOnKillRepFaction2, (id) =>
    this.sqliteQueryService.getFactionNameByNameId(id),
  );
}
