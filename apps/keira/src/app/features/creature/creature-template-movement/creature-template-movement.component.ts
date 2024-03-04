import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/core';
import { CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-movement',
  templateUrl: './creature-template-movement.component.html',
})
export class CreatureTemplateMovementComponent extends SingleRowEditorComponent<CreatureTemplateMovement> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_MOVEMENT_TABLE;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateMovementService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
