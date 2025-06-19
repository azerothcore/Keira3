import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { UnusedGuidService, DbOptions, MAX_INT_UNSIGNED_VALUE } from './unused-guid-search.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-features-unused-guid-search',
  templateUrl: './unused-guid-search.component.html',
  styleUrl: './unused-guid-search.component.scss',
  imports: [FormsModule, ReactiveFormsModule, TranslateModule],
})
export class UnusedGuidSearchComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly unusedGuidService = inject(UnusedGuidService);

  protected readonly MAX_INT_UNSIGNED_VALUE = MAX_INT_UNSIGNED_VALUE;

  protected readonly dbOptions: DbOptions[] = [
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

  protected readonly form = new FormGroup<{
    selectedDb: FormControl<DbOptions>;
    startIndex: FormControl<number>;
    amount: FormControl<number>;
    consecutive: FormControl<boolean>;
  }>({
    selectedDb: new FormControl<DbOptions>(this.dbOptions[0], [Validators.required]) as FormControl<DbOptions>,
    startIndex: new FormControl<number>(1, [
      Validators.required,
      Validators.min(1),
      Validators.max(MAX_INT_UNSIGNED_VALUE),
    ]) as FormControl<number>,
    amount: new FormControl<number>(10, [
      Validators.required,
      Validators.min(1),
      Validators.max(MAX_INT_UNSIGNED_VALUE),
    ]) as FormControl<number>,
    consecutive: new FormControl<boolean>(false, [Validators.required]) as FormControl<boolean>,
  });

  protected results: string[] = [];
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected onSearch(): void {
    this.error.set('');

    if (this.form.invalid) {
      this.error.set(`Please enter valid numbers for Amount and Start Index (1 to ${MAX_INT_UNSIGNED_VALUE}).`);
      return;
    }
    const { selectedDb, startIndex, amount, consecutive } = this.form.value as {
      selectedDb: DbOptions;
      startIndex: number;
      amount: number;
      consecutive: boolean;
    };

    this.results = [];
    this.loading.set(true);
    this.unusedGuidService
      .search(selectedDb, startIndex, amount, consecutive)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (guids: string[]) => {
          this.results = guids;
          if (this.results.length < amount) {
            this.error.set(`Only found ${this.results.length} unused GUIDs.`);
          }
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        },
      });
  }
}
