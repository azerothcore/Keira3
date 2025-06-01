import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
  imports: [FormsModule, ReactiveFormsModule, TranslateModule],
})
export class UnusedGuidSearchComponent {
  private readonly mysql = inject(MysqlQueryService);

  protected readonly MAX_INT_UNSIGNED_VALUE = 4294967295;

  protected readonly dbOptions = [
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
  protected selectedDb = this.dbOptions[0];
  protected results: string[] = [];
  protected loading = signal(false);
  protected error = signal('');
  protected consecutive = false;
  protected amount = 10;
  protected startIndex = 1;

  protected async onSearch(): Promise<void> {
    this.error.set('');

    if (this.amount === null) {
      this.error.set(`Amount value must be a number.`);
      return;
    }

    if (
      this.startIndex < 1 ||
      this.amount < 1 ||
      this.startIndex > this.MAX_INT_UNSIGNED_VALUE ||
      this.amount > this.MAX_INT_UNSIGNED_VALUE
    ) {
      this.error.set(`Start Index and Amount must be safe integers between 1 and ${this.MAX_INT_UNSIGNED_VALUE}.`);
      return;
    }

    this.results = [];
    this.loading.set(true);
    try {
      const usedGuids = await this.fetchUsedGuids();

      if (this.consecutive) {
        this.results = this.findConsecutiveUnusedGuids(usedGuids).map(String);
      } else {
        this.results = this.findUnusedGuids(usedGuids).map(String);
      }

      if (this.results.length < this.amount) {
        this.error.set(`Only found ${this.results.length} unused GUIDs.`);
      }
    } catch (e: any) {
      this.error.set(e?.message || 'Error searching for unused GUIDs');
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchUsedGuids(): Promise<Set<number>> {
    const rows = await firstValueFrom(
      this.mysql.query<{ guid: number }>(
        `SELECT ${this.selectedDb.key} AS guid FROM ${this.selectedDb.table} WHERE ${this.selectedDb.key} >= ${this.startIndex}`,
      ),
    );

    return new Set(rows.map((r) => Number(r.guid)));
  }

  private findUnusedGuids(usedGuids: Set<number>): number[] {
    if (this.amount === null) {
      return [];
    }

    let current = this.startIndex;

    const found: number[] = [];
    while (found.length < this.amount) {
      if (!usedGuids.has(current)) {
        found.push(current);
      }
      current++;
      if (current >= this.MAX_INT_UNSIGNED_VALUE) {
        break;
      }
    }
    return found;
  }

  private findConsecutiveUnusedGuids(usedGuids: Set<number>): number[] {
    if (this.amount === null) {
      return [];
    }

    let current = this.startIndex;

    let streak = 0;
    let streakStart = current;

    const found: number[] = [];

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

    return found;
  }
}
