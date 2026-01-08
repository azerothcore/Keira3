import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  GAMEOBJECT_TEMPLATE_TABLE,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_ADDON_TABLE,
  GAMEOBJECT_TEMPLATE_ADDON_ID,
  GAMEOBJECT_QUESTITEM_TABLE,
  GAMEOBJECT_QUESTITEM_ID,
  GAMEOBJECT_LOOT_TEMPLATE_TABLE,
  LOOT_TEMPLATE_ID,
} from '@keira/shared/acore-world-model';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { Router } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-copy',
  templateUrl: './gameobject-copy.component.html',
  standalone: true,
  imports: [CopyOutputComponent],
})
export class GameobjectCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(GameobjectHandlerService);

  protected readonly tableName = GAMEOBJECT_TEMPLATE_TABLE;
  protected readonly idField = GAMEOBJECT_TEMPLATE_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables = [
    { tableName: GAMEOBJECT_TEMPLATE_ADDON_TABLE, idField: GAMEOBJECT_TEMPLATE_ADDON_ID },
    { tableName: GAMEOBJECT_QUESTITEM_TABLE, idField: GAMEOBJECT_QUESTITEM_ID },
    { tableName: GAMEOBJECT_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
  ];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/gameobject/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
