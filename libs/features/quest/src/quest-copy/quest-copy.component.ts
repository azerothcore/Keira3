import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { QuestHandlerService } from '../quest-handler.service';
import { Router } from '@angular/router';
import {
  QUEST_TEMPLATE_TABLE,
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_ADDON_TABLE,
  QUEST_TEMPLATE_ADDON_ID,
  QUEST_TEMPLATE_LOCALE_TABLE,
  QUEST_TEMPLATE_LOCALE_ID,
  QUEST_OFFER_REWARD_TABLE,
  QUEST_OFFER_REWARD_ID,
  QUEST_REQUEST_ITEMS_TABLE,
  QUEST_REQUEST_ITEMS_ID,
  CREATURE_QUESTSTARTER_TABLE,
  CREATURE_QUESTSTARTER_ID,
  CREATURE_QUESTENDER_TABLE,
  CREATURE_QUESTENDER_ID,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  GAMEOBJECT_QUESTSTARTER_ID,
  GAMEOBJECT_QUESTENDER_TABLE,
  GAMEOBJECT_QUESTENDER_ID,
} from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-copy',
  templateUrl: './quest-copy.component.html',

  imports: [CopyOutputComponent],
})
export class QuestCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(QuestHandlerService);

  protected readonly tableName = QUEST_TEMPLATE_TABLE;
  protected readonly idField = QUEST_TEMPLATE_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables = [
    { tableName: QUEST_TEMPLATE_ADDON_TABLE, idField: QUEST_TEMPLATE_ADDON_ID },
    { tableName: QUEST_TEMPLATE_LOCALE_TABLE, idField: QUEST_TEMPLATE_LOCALE_ID },
    { tableName: QUEST_OFFER_REWARD_TABLE, idField: QUEST_OFFER_REWARD_ID },
    { tableName: QUEST_REQUEST_ITEMS_TABLE, idField: QUEST_REQUEST_ITEMS_ID },
    { tableName: CREATURE_QUESTSTARTER_TABLE, idField: CREATURE_QUESTSTARTER_ID, copyMode: 'RAW' as const, columns: ['id', 'quest'] },
    { tableName: CREATURE_QUESTENDER_TABLE, idField: CREATURE_QUESTENDER_ID, copyMode: 'RAW' as const, columns: ['id', 'quest'] },
    {
      tableName: GAMEOBJECT_QUESTSTARTER_TABLE,
      idField: GAMEOBJECT_QUESTSTARTER_ID,
      copyMode: 'RAW' as const,
      columns: ['id', 'quest'],
    },
    {
      tableName: GAMEOBJECT_QUESTENDER_TABLE,
      idField: GAMEOBJECT_QUESTENDER_ID,
      copyMode: 'RAW' as const,
      columns: ['id', 'quest'],
    },
  ];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/quest/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
