import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-movement',
  templateUrl: './creature-template-movement.component.html',
  imports: [TopBarComponent, TranslateModule, QueryOutputComponent, FormsModule, ReactiveFormsModule, TooltipModule],
})
export class CreatureTemplateMovementComponent extends SingleRowEditorComponent<CreatureTemplateMovement> {
  protected override get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_MOVEMENT_TABLE;
  }

  protected override readonly editorService = inject(CreatureTemplateMovementService);
  readonly handlerService = inject(CreatureHandlerService);
}
