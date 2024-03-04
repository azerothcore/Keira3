import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  CREATURE_TEMPLATE_RESISTANCE_SCHOOL,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
  CreatureTemplateResistance,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-resistance',
  templateUrl: './creature-template-resistance.component.html',
})
export class CreatureTemplateResistanceComponent extends MultiRowEditorComponent<CreatureTemplateResistance> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_RESISTANCE_TABLE;
  }

  readonly CREATURE_TEMPLATE_RESISTANCE_SCHOOL = CREATURE_TEMPLATE_RESISTANCE_SCHOOL;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateResistanceService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
