import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/core';
import { CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateMovementService } from './creature-template-movement.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-movement',
  templateUrl: './creature-template-movement.component.html',
  standalone: true,
  imports: [TopBarComponent, NgIf, TranslateModule, QueryOutputComponent, FormsModule, ReactiveFormsModule, TooltipModule],
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
