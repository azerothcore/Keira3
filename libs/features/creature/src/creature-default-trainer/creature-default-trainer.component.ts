import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureDefaultTrainer } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureDefaultTrainerService } from './creature-default-trainer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-default-trainer',
  templateUrl: './creature-default-trainer.component.html',
  imports: [TopBarComponent, TranslateDirective, TranslatePipe, QueryOutputComponent, FormsModule, ReactiveFormsModule, TooltipDirective],
})
export class CreatureDefaultTrainerComponent extends SingleRowEditorComponent<CreatureDefaultTrainer> {
  protected override readonly editorService = inject(CreatureDefaultTrainerService);
  readonly handlerService = inject(CreatureHandlerService);
}
