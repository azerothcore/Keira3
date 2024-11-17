import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CREATURE_TEMPLATE_RESISTANCE_SCHOOL,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
  CreatureTemplateResistance,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent, SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-resistance',
  templateUrl: './creature-template-resistance.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    SingleValueSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
    TooltipModule,
  ],
})
export class CreatureTemplateResistanceComponent extends MultiRowEditorComponent<CreatureTemplateResistance> {
  protected override get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_RESISTANCE_TABLE;
  }

  protected readonly CREATURE_TEMPLATE_RESISTANCE_SCHOOL = CREATURE_TEMPLATE_RESISTANCE_SCHOOL;

  override readonly editorService = inject(CreatureTemplateResistanceService);
  readonly handlerService = inject(CreatureHandlerService);
}
