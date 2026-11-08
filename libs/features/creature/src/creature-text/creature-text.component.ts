import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureText, EMOTE, TEXT_RANGE, TEXT_TYPE } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent, LanguageSelectorBtnComponent, SoundEntriesSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { BroadcastTextBrowserComponent } from './broadcast-text-browser/broadcast-text-browser.component';
import { CreatureTextService } from './creature-text.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-text',
  templateUrl: './creature-text.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    TooltipDirective,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    LanguageSelectorBtnComponent,
    SoundEntriesSelectorBtnComponent,
    GenericOptionSelectorComponent,
    BroadcastTextBrowserComponent,
  ],
})
export class CreatureTextComponent extends MultiRowEditorComponent<CreatureText> {
  protected readonly TEXT_TYPE = TEXT_TYPE;
  protected readonly TEXT_RANGE = TEXT_RANGE;
  protected readonly EMOTE = EMOTE;

  protected override readonly editorService = inject(CreatureTextService);
  protected override readonly handlerService = inject(CreatureHandlerService);

  /** Why the Text couldn't be read from the broadcast_text (an i18n key), or ''. */
  protected readonly textProblem = signal('');

  protected async textFromBroadcastText(): Promise<void> {
    this.textProblem.set(await this.editorService.textFromBroadcastText());
  }
}
