import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { firstValueFrom } from 'rxjs';
import {
  CREATURE_SPAWN_TABLE,
  CREATURE_SPAWN_ID_2,
  GAMEOBJECT_SPAWN_TABLE,
  GAMEOBJECT_SPAWN_ID_2,
  CREATURE_TEMPLATE_TABLE,
  CREATURE_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_TABLE,
  GAMEOBJECT_TEMPLATE_ID,
  GOSSIP_MENU_TABLE,
  GOSSIP_MENU_ID,
  NPC_TEXT_TABLE,
  NPC_TEXT_ID,
  PAGE_TEXT_TABLE,
  PAGE_TEXT_ID,
  ACORE_STRING_TABLE,
  ACORE_STRING_ENTRY,
} from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-features-unused-guid-search',
  templateUrl: './unused-guid-search.component.html',
  styleUrl: './unused-guid-search.component.scss',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
})
export class UnusedGuidSearchComponent {
  readonly MAX_INT_UNSIGNED_VALUE = 4294967295;

  dbOptions = [
    { table: CREATURE_SPAWN_TABLE, key: CREATURE_SPAWN_ID_2, label: `${CREATURE_SPAWN_TABLE} (${CREATURE_SPAWN_ID_2})` },
    { table: GAMEOBJECT_SPAWN_TABLE, key: GAMEOBJECT_SPAWN_ID_2, label: `${GAMEOBJECT_SPAWN_TABLE} (${GAMEOBJECT_SPAWN_ID_2})` },
    { table: CREATURE_TEMPLATE_TABLE, key: CREATURE_TEMPLATE_ID, label: `${CREATURE_TEMPLATE_TABLE} (${CREATURE_TEMPLATE_ID})` },
    { table: GAMEOBJECT_TEMPLATE_TABLE, key: GAMEOBJECT_TEMPLATE_ID, label: `${GAMEOBJECT_TEMPLATE_TABLE} (${GAMEOBJECT_TEMPLATE_ID})` },
    { table: GOSSIP_MENU_TABLE, key: GOSSIP_MENU_ID, label: `${GOSSIP_MENU_TABLE} (${GOSSIP_MENU_ID})` },
    { table: NPC_TEXT_TABLE, key: NPC_TEXT_ID, label: `${NPC_TEXT_TABLE} (${NPC_TEXT_ID})` },
    { table: PAGE_TEXT_TABLE, key: PAGE_TEXT_ID, label: `${PAGE_TEXT_TABLE} (${PAGE_TEXT_ID})` },
    { table: ACORE_STRING_TABLE, key: ACORE_STRING_ENTRY, label: `${ACORE_STRING_TABLE} (${ACORE_STRING_ENTRY})` },
    { table: 'waypoint_scripts', key: 'id', label: 'waypoint_scripts (id)' },
    { table: 'pool_template', key: 'entry', label: 'pool_template (entry)' },
    { table: 'game_event', key: 'eventEntry', label: 'game_event (eventEntry)' },
  ];
  selectedDb = this.dbOptions[0];
  results: string[] = [];
  loading = false;
  error = '';
  consecutive = false;
  amount = 10;
  startIndex = 1;

  constructor(
    private mysql: MysqlQueryService,
    private cdr: ChangeDetectorRef,
  ) {}

  async onSearch() {
    this.error = '';

    if (
      this.startIndex < 1 ||
      this.amount < 1 ||
      this.startIndex > this.MAX_INT_UNSIGNED_VALUE ||
      this.amount > this.MAX_INT_UNSIGNED_VALUE
    ) {
      this.error = `Start Index and Amount must be safe integers between 1 and ${this.MAX_INT_UNSIGNED_VALUE}.`;
      return;
    }

    this.results = [];
    this.loading = true;
    try {
      // Fetch all existing GUIDs
      const rows = await firstValueFrom(
        this.mysql.query<{ guid: number }>(
          `SELECT ${this.selectedDb.key} AS guid FROM ${this.selectedDb.table} WHERE ${this.selectedDb.key} >= ${this.startIndex}`,
        ),
      );
      const usedGuids = new Set(rows.map((r) => Number(r.guid)));

      // Find unused GUIDs
      const found: number[] = [];
      let current = this.startIndex;
      if (this.consecutive) {
        let streak = 0;
        let streakStart = current;
        while (found.length < this.amount) {
          if (!usedGuids.has(current)) {
            streak++;
            if (streak === 1) {
              streakStart = current;
            }
            if (streak === this.amount) {
              for (let i = 0; i < this.amount; i++) {
                found.push(streakStart + i);
              }
              break;
            }
          } else {
            streak = 0;
          }
          current++;
          if (current >= this.MAX_INT_UNSIGNED_VALUE) {
            break;
          }
        }
      } else {
        while (found.length < this.amount) {
          if (!usedGuids.has(current)) {
            found.push(current);
          }
          current++;
          if (current >= this.MAX_INT_UNSIGNED_VALUE) {
            break;
          }
        }
      }
      this.results = found.map(String);
      if (found.length < this.amount) {
        this.error = `Only found ${found.length} unused GUIDs.`;
      }
    } catch (e: any) {
      this.error = e?.message || 'Error searching for unused GUIDs';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }
}
