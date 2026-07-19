import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TRAINER_TYPE, Trainer } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TrainerService } from './trainer.service';
import { TrainerHandlerService } from '../trainer-handler.service';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-trainer',
  templateUrl: './trainer.component.html',
  imports: [
    TopBarComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    QueryOutputComponent,
    GenericOptionSelectorComponent,
  ],
})
export class TrainerComponent extends SingleRowEditorComponent<Trainer> {
  protected override readonly editorService = inject(TrainerService);
  protected readonly handlerService = inject(TrainerHandlerService);
  protected readonly TRAINER_TYPE = TRAINER_TYPE;
}
