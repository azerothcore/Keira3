import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureText, EMOTE, TEXT_RANGE, TEXT_TYPE } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import {
  GenericOptionSelectorComponent,
  LanguageSelectorBtnComponent,
  SingleValueSelectorBtnComponent,
  SoundEntriesSelectorBtnComponent,
} from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTextService } from './creature-text.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-text',
  templateUrl: './creature-text.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    TooltipModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    SingleValueSelectorBtnComponent,
    LanguageSelectorBtnComponent,
    SoundEntriesSelectorBtnComponent,
    GenericOptionSelectorComponent,
  ],
})
export class CreatureTextComponent extends MultiRowEditorComponent<CreatureText> {
  protected readonly TEXT_TYPE = TEXT_TYPE;
  protected readonly TEXT_RANGE = TEXT_RANGE;
  protected readonly EMOTE = EMOTE;

  public override readonly editorService = inject(CreatureTextService);
  protected override readonly handlerService = inject(CreatureHandlerService);
}
