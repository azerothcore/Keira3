import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CREATURE_TEMPLATE_SPELL_TABLE, CreatureTemplateSpell } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { SpellSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateSpellService } from './creature-template-spell.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-spell',
  templateUrl: './creature-template-spell.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    SpellSelectorBtnComponent,
    IconComponent,
    AsyncPipe,
  ],
})
export class CreatureTemplateSpellComponent extends MultiRowEditorComponent<CreatureTemplateSpell> {
  protected override get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_SPELL_TABLE;
  }

  protected readonly SPELL_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7];

  override readonly editorService = inject(CreatureTemplateSpellService);
  readonly handlerService = inject(CreatureHandlerService);
  readonly sqliteQueryService = inject(SqliteQueryService);
}
