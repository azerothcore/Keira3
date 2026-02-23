import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { TrainerHandlerService } from '../trainer-handler.service';
import { Router } from '@angular/router';
import { TRAINER_ID, TRAINER_SPELL_ID, TRAINER_SPELL_TABLE, TRAINER_TABLE } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-trainer-copy',
  templateUrl: './trainer-copy.component.html',

  imports: [CopyOutputComponent],
})
export class TrainerCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(TrainerHandlerService);

  protected readonly tableName = TRAINER_TABLE;
  protected readonly idField = TRAINER_ID ?? 'id';
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables = [{ tableName: TRAINER_SPELL_TABLE, idField: TRAINER_SPELL_ID }];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/trainer/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
