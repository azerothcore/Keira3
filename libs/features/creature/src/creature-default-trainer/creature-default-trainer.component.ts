import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureDefaultTrainer } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureDefaultTrainerService } from './creature-default-trainer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-default-trainer',
  templateUrl: './creature-default-trainer.component.html',
  imports: [TopBarComponent, TranslateModule, QueryOutputComponent, FormsModule, ReactiveFormsModule, TooltipModule],
})
export class CreatureDefaultTrainerComponent extends SingleRowEditorComponent<CreatureDefaultTrainer> {
  protected override readonly editorService = inject(CreatureDefaultTrainerService);
  readonly handlerService = inject(CreatureHandlerService);
}
