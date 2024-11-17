import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NpcTrainer } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { SkillSelectorBtnComponent, SpellSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcTrainerService } from './npc-trainer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-trainer',
  templateUrl: './npc-trainer.component.html',
  styleUrls: ['./npc-trainer.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
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
    IconComponent,
  ],
})
export class NpcTrainerComponent extends MultiRowEditorComponent<NpcTrainer> {
  override readonly editorService = inject(NpcTrainerService);
  readonly handlerService = inject(CreatureHandlerService);
  readonly sqliteQueryService = inject(SqliteQueryService);
}
