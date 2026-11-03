import { NameCache } from '@keira/shared/utils';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureQueststarter } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { CreatureSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { CreatureQueststarterService } from './creature-queststarter.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-queststarter',
  templateUrl: './creature-queststarter.component.html',
  styleUrls: ['./creature-queststarter.component.scss'],
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    CreatureSelectorBtnComponent,
    TooltipDirective,
    EditorButtonsComponent,
    NgxDatatableModule,
    QuestPreviewComponent,
  ],
})
export class CreatureQueststarterComponent extends MultiRowEditorComponent<CreatureQueststarter> {
  /** The names shown, read once each: the table sorts by them. */
  protected readonly names = new NameCache(
    (id) => this.editorService.queryService.getCreatureNameById(id),
    () => this.changeDetectorRef.markForCheck(),
  );
  protected override readonly editorService = inject(CreatureQueststarterService);
  readonly handlerService = inject(QuestHandlerService);
  readonly questPreviewService = inject(QuestPreviewService);
}
