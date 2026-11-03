import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { TrainerHandlerService } from '../trainer-handler.service';
import { TRAINER_ID, TRAINER_SPELL_ID, TRAINER_SPELL_TABLE, TRAINER_TABLE } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-trainer-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="trainer/select"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class TrainerCopyComponent {
  protected readonly handlerService = inject(TrainerHandlerService);

  protected readonly tableName = TRAINER_TABLE;
  protected readonly idField = TRAINER_ID;

  protected readonly relatedTables = [{ tableName: TRAINER_SPELL_TABLE, idField: TRAINER_SPELL_ID }];
}
