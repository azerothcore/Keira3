import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { GAME_TELE_TABLE, GAME_TELE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-tele-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="game-tele/select"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class GameTeleCopyComponent {
  protected readonly handlerService = inject(GameTeleHandlerService);

  protected readonly tableName = GAME_TELE_TABLE;
  protected readonly idField = GAME_TELE_ID;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];
}
