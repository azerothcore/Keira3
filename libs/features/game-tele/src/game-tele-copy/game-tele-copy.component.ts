import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { Router } from '@angular/router';
import { GAME_TELE_TABLE, GAME_TELE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-tele-copy',
  templateUrl: './game-tele-copy.component.html',
  standalone: true,
  imports: [CopyOutputComponent],
})
export class GameTeleCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(GameTeleHandlerService);

  protected readonly tableName = GAME_TELE_TABLE;
  protected readonly idField = GAME_TELE_ID ?? 'id';
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/game-tele/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
