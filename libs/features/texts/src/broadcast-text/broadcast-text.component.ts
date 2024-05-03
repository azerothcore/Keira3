import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { BroadcastTextService } from './broadcast-text.service';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BroadcastText } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './broadcast-text.component.html',
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
export class BroadcastTextComponent extends SingleRowEditorComponent<BroadcastText> {
  readonly editorService = inject(BroadcastTextService);
  protected readonly handlerService = inject(BroadcastTextHandlerService);
}
