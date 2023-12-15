import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { CreatureTemplateMovement } from '@keira-types/creature-template-movement.type';
import { CREATURE_TEMPLATE_RESISTANCE_TABLE } from '@keira-types/creature-template-resistance.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-creature-template-movement',
  templateUrl: './creature-template-movement.component.html',
})
export class CreatureTemplateMovementComponent extends SingleRowEditorComponent<CreatureTemplateMovement> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_RESISTANCE_TABLE;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureTemplateMovementService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
