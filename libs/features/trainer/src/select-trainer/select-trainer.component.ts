import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { TRAINER_ID, TRAINER_TABLE, Trainer } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainerHandlerService } from '../trainer-handler.service';
import { SelectTrainerService } from './select-trainer.service';
import { WIKI_BASE_URL } from '@keira/shared/constants';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-trainer.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxDatatableModule,
    CreateComponent,
    HighlightjsWrapperComponent,
    TopBarComponent,
  ],
})
export class SelectTrainerComponent extends SelectComponent<Trainer> {
  protected override readonly entityTable = TRAINER_TABLE;
  protected override readonly entityIdField = TRAINER_ID;
  readonly customStartingId = 1000000;
  protected readonly selectService = inject(SelectTrainerService);
  readonly handlerService = inject(TrainerHandlerService);
  protected readonly WIKI_BASE_URL = WIKI_BASE_URL;
}
