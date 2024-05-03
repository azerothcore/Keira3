import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { NpcTextService } from './npc-text.service';
import { NpcTextHandlerService } from './npc-text-handler.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NpcText } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './npc-text.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    ReactiveFormsModule,
    EditorButtonsComponent,
    SingleValueSelectorBtnComponent,
    TooltipModule,
  ],
})
export class NpcTextComponent extends SingleRowEditorComponent<NpcText> {
  readonly editorService = inject(NpcTextService);
  protected readonly handlerService = inject(NpcTextHandlerService);
}
