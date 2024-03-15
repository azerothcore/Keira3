import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_SPELL_TABLE, CreatureTemplateSpell } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateSpellService } from './creature-template-spell.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/base-editor-components';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-spell',
  templateUrl: './creature-template-spell.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class CreatureTemplateSpellComponent extends MultiRowEditorComponent<CreatureTemplateSpell> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_SPELL_TABLE;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateSpellService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
