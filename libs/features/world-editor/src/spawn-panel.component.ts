import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SPAWN_FIELDS, SpawnRecord } from './world-editor.model';

/**
 * The selected spawn's own columns (respawn time, movement, wander distance, phase and spawn masks, equipment, or a
 * gameobject's state): each change is emitted right away, as `{ column: value }`.
 */
@Component({
  selector: 'keira-spawn-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="row g-1 mt-2" data-testid="spawn-panel">
      @for (field of fields(); track field.column) {
        <div class="col-6">
          <div class="input-group input-group-sm" [class.changed]="changed()[field.column]">
            <span class="input-group-text">{{ field.label | translate }}</span>
            @if (field.options) {
              <select class="form-select" [attr.data-testid]="'spawn-' + field.column" (change)="set(field.column, $event)">
                @for (option of field.options; track option.value) {
                  <option [value]="option.value" [selected]="values()[field.column] === option.value">
                    {{ option.label | translate }}
                  </option>
                }
              </select>
            } @else {
              <input
                type="number"
                min="0"
                [step]="field.step ?? 1"
                class="form-control"
                [attr.data-testid]="'spawn-' + field.column"
                [value]="values()[field.column]"
                (change)="set(field.column, $event)"
              />
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .changed .input-group-text {
      background: var(--bs-warning-bg-subtle, #fff3cd);
    }
  `,
})
export class SpawnPanelComponent {
  readonly spawn = input.required<SpawnRecord>();
  /** The columns as stored (or the new spawn's defaults). */
  readonly stored = input.required<Record<string, number>>();
  /** The columns changed so far. */
  readonly edits = input<Record<string, number>>({});
  readonly edited = output<Record<string, number>>();

  protected readonly fields = computed(() => SPAWN_FIELDS[this.spawn().type]);
  protected readonly values = computed(() => ({ ...this.stored(), ...this.edits() }));
  protected readonly changed = computed(() => {
    const stored = this.stored();
    return Object.fromEntries(Object.entries(this.edits()).map(([column, value]) => [column, stored[column] !== value]));
  });

  protected set(column: string, event: Event): void {
    const element = event.target as HTMLInputElement | HTMLSelectElement;
    const value = Number(element.value);
    if (element.value === '' || !Number.isFinite(value) || value < 0) {
      element.value = String(this.values()[column]);
      return;
    }
    this.edited.emit({ [column]: value });
  }
}
