import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BroadcastText, EMOTE } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { LanguageSelectorBtnComponent, SingleValueSelectorBtnComponent, SoundEntriesSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';
import { BroadcastTextService } from './broadcast-text.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './broadcast-text.component.html',
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    ReactiveFormsModule,
    SingleValueSelectorBtnComponent,
    TooltipModule,
    LanguageSelectorBtnComponent,
    SoundEntriesSelectorBtnComponent,
  ],
})
export class BroadcastTextComponent extends SingleRowEditorComponent<BroadcastText> {
  protected override readonly editorService = inject(BroadcastTextService);
  protected override readonly handlerService = inject(BroadcastTextHandlerService);

  protected readonly EMOTE = EMOTE;
}
