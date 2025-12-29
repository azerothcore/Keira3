import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainerSpell } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { SkillSelectorBtnComponent, SpellSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TrainerHandlerService } from '../trainer-handler.service';
import { TrainerSpellService } from './trainer-spell.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-trainer-spell',
  templateUrl: './trainer-spell.component.html',
  styleUrls: ['./trainer-spell.component.scss'],
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
  ],
})
export class TrainerSpellComponent extends MultiRowEditorComponent<TrainerSpell> {
  protected override readonly editorService = inject(TrainerSpellService);
  readonly handlerService = inject(TrainerHandlerService);
  readonly sqliteQueryService = inject(SqliteQueryService);
}
