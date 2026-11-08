import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QUEST_LOCALE, GossipMenuOptionLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionLocaleService } from './gossip-menu-option-locale.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu-option-locale',
  templateUrl: './gossip-menu-option-locale.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
  ],
})
export class GossipMenuOptionLocaleComponent extends MultiRowEditorComponent<GossipMenuOptionLocale> {
  protected override readonly editorService = inject(GossipMenuOptionLocaleService);
  readonly handlerService = inject(GossipHandlerService);
  /** (the locales the core reads: deDE, esES…) */
  protected readonly LOCALES = QUEST_LOCALE;
}
