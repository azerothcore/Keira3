import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateMovementService } from './creature-template-movement.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';

import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-template-movement',
  templateUrl: './creature-template-movement.component.html',
  standalone: true,
  imports: [TopBarComponent, TranslateModule, QueryOutputComponent, FormsModule, ReactiveFormsModule, TooltipModule],
})
export class CreatureTemplateMovementComponent extends SingleRowEditorComponent<CreatureTemplateMovement> {
  protected override get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_MOVEMENT_TABLE;
  }

  override readonly editorService = inject(CreatureTemplateMovementService);
  readonly handlerService = inject(CreatureHandlerService);
}
