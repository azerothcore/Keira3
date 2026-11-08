import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { isSaiPath, WaypointRecord } from './world-editor.model';

/** What the waypoint panel can change about a point. */
export type WaypointEdits = Pick<WaypointRecord, 'delay' | 'moveType' | 'orientation' | 'action' | 'actionChance'>;

/** waypoint_data.move_type, as offered. */
export const MOVE_TYPES = [
  { value: 0, label: 'WORLD_EDITOR.MOVE_WALK' },
  { value: 1, label: 'WORLD_EDITOR.MOVE_RUN' },
  { value: 2, label: 'WORLD_EDITOR.MOVE_LAND' },
  { value: 3, label: 'WORLD_EDITOR.MOVE_TAKE_OFF' },
];

/**
 * The selected waypoint's settings: how long the creature waits there, how it moves on, which way it faces and the
 * script it runs (SmartAI paths only have the wait and the facing); plus inserting a point after it and renumbering.
 */
@Component({
  selector: 'keira-waypoint-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <form class="mt-2" data-testid="waypoint-panel" [formGroup]="form" (ngSubmit)="apply()">
      <div class="row g-1 mb-1">
        <div class="col-6">
          <div class="input-group input-group-sm">
            <span class="input-group-text">{{ 'WORLD_EDITOR.WAIT_MS' | translate }}</span>
            <input type="number" min="0" class="form-control" data-testid="waypoint-delay" formControlName="delay" />
          </div>
        </div>
        <div class="col-6">
          <div class="input-group input-group-sm">
            <span class="input-group-text">{{ 'WORLD_EDITOR.FACING' | translate }}</span>
            <input
              type="number"
              step="any"
              class="form-control"
              data-testid="waypoint-orientation"
              formControlName="orientation"
              [placeholder]="'WORLD_EDITOR.FACING_KEEP' | translate"
            />
          </div>
        </div>
        @if (!sai()) {
          <div class="col-6">
            <select class="form-select form-select-sm" data-testid="waypoint-move-type" formControlName="moveType">
              @for (type of moveTypes; track type.value) {
                <option [ngValue]="type.value">{{ type.label | translate }}</option>
              }
            </select>
          </div>
          <div class="col-6">
            <div class="input-group input-group-sm">
              <span class="input-group-text">{{ 'WORLD_EDITOR.SCRIPT' | translate }}</span>
              <input type="number" min="0" class="form-control" data-testid="waypoint-action" formControlName="action" />
              <input type="number" min="0" max="100" class="form-control" data-testid="waypoint-chance" formControlName="actionChance" />
              <span class="input-group-text">%</span>
            </div>
          </div>
        }
      </div>
      <div class="d-flex gap-1 flex-wrap">
        <button type="submit" class="btn btn-sm btn-primary" data-testid="waypoint-apply">{{ 'WORLD_EDITOR.APPLY' | translate }}</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-testid="waypoint-insert" (click)="insertAfter.emit()">
          <i class="fa fa-plus"></i> {{ 'WORLD_EDITOR.INSERT_AFTER' | translate }}
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-testid="waypoint-renumber" (click)="renumber.emit()">
          {{ 'WORLD_EDITOR.RENUMBER' | translate }}
        </button>
      </div>
    </form>
  `,
})
export class WaypointPanelComponent {
  readonly waypoint = input.required<WaypointRecord>();
  readonly edited = output<WaypointEdits>();
  readonly insertAfter = output<void>();
  readonly renumber = output<void>();

  protected readonly moveTypes = MOVE_TYPES;
  protected readonly form = new FormGroup({
    delay: new FormControl<number | null>(0),
    moveType: new FormControl(0, { nonNullable: true }),
    orientation: new FormControl<number | null>(null),
    action: new FormControl<number | null>(0),
    actionChance: new FormControl<number | null>(100),
  });

  protected sai(): boolean {
    return isSaiPath(this.waypoint().pathId);
  }

  constructor() {
    effect(() => {
      const waypoint = this.waypoint();
      this.form.setValue({
        delay: waypoint.delay,
        moveType: waypoint.moveType ?? 0,
        orientation: waypoint.orientation ?? null,
        action: waypoint.action ?? 0,
        actionChance: waypoint.actionChance ?? 100,
      });
    });
  }

  protected apply(): void {
    const value = this.form.getRawValue();
    const whole = (n: number | null, fallback: number) => (n === null || !Number.isFinite(n) || n < 0 ? fallback : Math.round(n));
    this.edited.emit({
      delay: whole(value.delay, 0),
      orientation: value.orientation === null || !Number.isFinite(value.orientation) ? null : value.orientation,
      ...(this.sai()
        ? {}
        : { moveType: value.moveType, action: whole(value.action, 0), actionChance: Math.min(100, whole(value.actionChance, 100)) }),
    });
  }
}
