import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, Form } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
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
  private readonly fb = inject(FormBuilder);

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

  protected form: FormGroup = this.fb.group({
    selectedDb: [this.dbOptions[0], Validators.required],
    startIndex: [1, [Validators.required, Validators.min(1), Validators.max(this.MAX_INT_UNSIGNED_VALUE)]],
    amount: [10, [Validators.required, Validators.min(1), Validators.max(this.MAX_INT_UNSIGNED_VALUE)]],
    consecutive: [false, [Validators.required]],
  });

  protected results: string[] = [];
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected async onSearch(): Promise<void> {
    this.error.set('');

    if (this.form.invalid) {
      this.error.set(`Please enter valid numbers for Amount and Start Index (1 to ${this.MAX_INT_UNSIGNED_VALUE}).`);
      return;
    }

    const { selectedDb, startIndex, amount, consecutive } = this.form.value;

    this.results = [];
    this.loading.set(true);

    const query = `SELECT ${selectedDb.key} AS guid
                   FROM ${selectedDb.table}
                   WHERE ${selectedDb.key} >= ${startIndex}`;
    this.mysql.query<{ guid: number }>(query).subscribe({
      next: (rows) => {
        const usedGuids = new Set(rows.map((r) => Number(r.guid)));

        if (consecutive) {
          this.results = this.findConsecutiveUnusedGuids(usedGuids, startIndex, amount).map(String);
        } else {
          this.results = this.findUnusedGuids(usedGuids, startIndex, amount).map(String);
        }

        if (this.results.length < amount) {
          this.error.set(`Only found ${this.results.length} unused GUIDs.`);
        }
      },
      error: (err) => {
        this.error.set(err?.message || 'Error searching for unused GUIDs');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  private findUnusedGuids(usedGuids: Set<number>, startIndex: number, amount: number): number[] {
    let current = startIndex;

    const found: number[] = [];
    while (found.length < amount) {
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

  private findConsecutiveUnusedGuids(usedGuids: Set<number>, startIndex: number, amount: number): number[] {
    let current = startIndex;

    let streak = 0;
    let streakStart = current;

    const found: number[] = [];

    while (found.length < amount) {
      if (!usedGuids.has(current)) {
        streak++;

        if (streak === 1) {
          streakStart = current;
        }

        if (streak === amount) {
          for (let i = 0; i < amount; i++) {
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
