import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  GAMEOBJECT_TEMPLATE_TABLE,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_ADDON_TABLE,
  GAMEOBJECT_TEMPLATE_ADDON_ID,
  GAMEOBJECT_QUESTITEM_TABLE,
  GAMEOBJECT_QUESTITEM_ID,
} from '@keira/shared/acore-world-model';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="gameobject/select"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class GameobjectCopyComponent {
  protected readonly handlerService = inject(GameobjectHandlerService);

  protected readonly tableName = GAMEOBJECT_TEMPLATE_TABLE;
  protected readonly idField = GAMEOBJECT_TEMPLATE_ID;

  protected readonly relatedTables = [
    { tableName: GAMEOBJECT_TEMPLATE_ADDON_TABLE, idField: GAMEOBJECT_TEMPLATE_ADDON_ID },
    { tableName: GAMEOBJECT_QUESTITEM_TABLE, idField: GAMEOBJECT_QUESTITEM_ID },
    // (not the loot: it's found by the template's Data1, copied with it, not by the gameobject's entry)
  ];
}
