import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent, SqliteQueryService } from '@keira/shared/core';
import { NpcTrainer } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcTrainerService } from './npc-trainer.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/core';
import { SkillSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SpellSelectorBtnComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-trainer',
  templateUrl: './npc-trainer.component.html',
  styleUrls: ['./npc-trainer.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    SpellSelectorBtnComponent,
    TooltipModule,
    SkillSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    AsyncPipe,
  ],
})
export class NpcTrainerComponent extends MultiRowEditorComponent<NpcTrainer> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: NpcTrainerService,
    public handlerService: CreatureHandlerService,
    readonly sqliteQueryService: SqliteQueryService,
  ) {
    super(editorService, handlerService);
  }
}
