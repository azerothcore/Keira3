import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_TABLE,
  CREATURE_TEMPLATE_ADDON_TABLE,
  CREATURE_TEMPLATE_MODEL_TABLE,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
  CREATURE_TEMPLATE_SPELL_TABLE,
  CREATURE_TEMPLATE_MOVEMENT_TABLE,
  CREATURE_ONKLL_REPUTATION_TABLE,
  CREATURE_EQUIP_TEMPLATE_TABLE,
  NPC_VENDOR_TABLE,
  CREATURE_DEFAULT_TRAINER_TABLE,
  CREATURE_QUESTITEM_TABLE,
  CREATURE_LOOT_TEMPLATE_TABLE,
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  SKINNING_LOOT_TEMPLATE_TABLE,
  CREATURE_TEMPLATE_MOVEMENT_ID,
  CREATURE_TEMPLATE_SPELL_ID,
  CREATURE_TEMPLATE_RESISTANCE_ID,
  CREATURE_TEMPLATE_MODEL_ID,
  CREATURE_TEMPLATE_ADDON_ID,
  CREATURE_ONKLL_REPUTATION_ID,
  CREATURE_EQUIP_TEMPLATE_ID,
  NPC_VENDOR_ID,
  CREATURE_DEFAULT_TRAINER_ID,
  CREATURE_QUESTITEM_ID,
} from '@keira/shared/acore-world-model';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { CreatureHandlerService } from '../creature-handler.service';
import { Router } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-copy',
  templateUrl: './creature-copy.component.html',
  standalone: true,
  imports: [CopyOutputComponent],
})
export class CreatureCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(CreatureHandlerService);

  protected readonly tableName = CREATURE_TEMPLATE_TABLE;
  protected readonly idField = CREATURE_TEMPLATE_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables = [
    { tableName: CREATURE_TEMPLATE_ADDON_TABLE, idField: CREATURE_TEMPLATE_ADDON_ID },
    { tableName: CREATURE_TEMPLATE_MODEL_TABLE, idField: CREATURE_TEMPLATE_MODEL_ID },
    { tableName: CREATURE_TEMPLATE_RESISTANCE_TABLE, idField: CREATURE_TEMPLATE_RESISTANCE_ID },
    { tableName: CREATURE_TEMPLATE_SPELL_TABLE, idField: CREATURE_TEMPLATE_SPELL_ID },
    { tableName: CREATURE_TEMPLATE_MOVEMENT_TABLE, idField: CREATURE_TEMPLATE_MOVEMENT_ID },
    { tableName: CREATURE_ONKLL_REPUTATION_TABLE, idField: CREATURE_ONKLL_REPUTATION_ID },
    { tableName: CREATURE_EQUIP_TEMPLATE_TABLE, idField: CREATURE_EQUIP_TEMPLATE_ID },
    { tableName: NPC_VENDOR_TABLE, idField: NPC_VENDOR_ID },
    { tableName: CREATURE_DEFAULT_TRAINER_TABLE, idField: CREATURE_DEFAULT_TRAINER_ID },
    { tableName: CREATURE_QUESTITEM_TABLE, idField: CREATURE_QUESTITEM_ID },
    { tableName: CREATURE_LOOT_TEMPLATE_TABLE, idField: 'Entry' },
    { tableName: PICKPOCKETING_LOOT_TEMPLATE_TABLE, idField: 'Entry' },
    { tableName: SKINNING_LOOT_TEMPLATE_TABLE, idField: 'Entry' },
    /* Note: creature (spawns), creature_addon, smart_scripts, creature_text,
     and creature_formations are intentionally excluded as they typically
     should not be copied automatically with the template */
  ];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/creature/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
