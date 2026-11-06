import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { SqliteQueryService } from '@keira/shared/db-layer';
import { debounceTime, startWith } from 'rxjs';

/**
 * The name of the faction a field holds, under it: a faction template (FactionTemplate.dbc: creature_template.faction,
 * gameobject_template_addon.faction) or a faction (Faction.dbc: reputations).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-faction-name',
  template: `@if (name()) {
    <small class="faction-name text-muted" data-testid="faction-name">{{ name() }}</small>
  }`,
  styles: ':host { display: block; } .faction-name { display: block; margin-top: 0.15rem; }',
})
export class FactionNameComponent implements OnInit {
  private readonly sqliteQueryService = inject(SqliteQueryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly control = input.required<AbstractControl<number | string | null>>();
  /** The field holds a faction template (rather than a faction). */
  readonly template = input(false);

  protected readonly name = signal('');

  ngOnInit(): void {
    this.control()
      .valueChanges.pipe(startWith(this.control().value), debounceTime(150), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => void this.show(Number(value)));
  }

  private async show(id: number): Promise<void> {
    if (!(id > 0)) {
      this.name.set('');
      return;
    }
    const name = this.template() ? this.sqliteQueryService.getFactionNameById(id) : this.sqliteQueryService.getFactionNameByNameId(id);
    const found = await name;
    // (the field may have changed meanwhile)
    if (Number(this.control().value) === id) {
      this.name.set(found ?? '');
    }
  }
}
