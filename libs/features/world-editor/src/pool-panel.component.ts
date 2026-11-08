import { PoolProblem } from '@keira/shared/utils';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PoolMember } from './world-editor.model';

/**
 * The pool of the selected spawn (and of the others selected with it): its chance in it, taking it out, opening the
 * pool in the Pool Editor; or, out of a pool, putting the selection in a pool or in a new one.
 */
@Component({
  selector: 'keira-pool-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="pool-panel mt-2 small" data-testid="pool-panel">
      @if (member(); as member) {
        <div class="d-flex align-items-center gap-1 mb-1">
          <i class="fa fa-dice"></i>
          <strong data-testid="pool-name">{{ 'WORLD_EDITOR.POOL_N' | translate: { pool: member.pool } }}</strong>
          @if (member.description) {
            <span class="text-muted text-truncate">· {{ member.description }}</span>
          }
          <span class="text-muted ms-auto" data-testid="pool-max">max {{ member.maxLimit }}</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text">{{ 'WORLD_EDITOR.POOL_CHANCE' | translate }}</span>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            class="form-control"
            data-testid="pool-chance"
            [value]="member.chance"
            (change)="setChance($event, member.chance)"
          />
          <span class="input-group-text">%</span>
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text">max_limit</span>
          <input
            #maxLimit
            type="number"
            min="0"
            class="form-control"
            data-testid="pool-max-limit"
            [value]="member.maxLimit"
            (change)="editPool(maxLimit.value, description.value, member)"
          />
          <input
            #description
            class="form-control w-50"
            data-testid="pool-description"
            placeholder="description"
            [value]="member.description"
            (change)="editPool(maxLimit.value, description.value, member)"
          />
        </div>
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text">{{ 'WORLD_EDITOR.POOL_MOTHER' | translate }}</span>
          <input
            #mother
            type="number"
            min="1"
            class="form-control"
            data-testid="pool-mother"
            placeholder="pool_pool"
            [value]="member.mother ?? ''"
            (change)="setMother(mother.value, motherChance.value, member, mother)"
          />
          <input
            #motherChance
            type="number"
            min="0"
            max="100"
            step="any"
            class="form-control"
            data-testid="pool-mother-chance"
            placeholder="%"
            [value]="member.mother === null ? '' : member.motherChance"
            (change)="setMother(mother.value, motherChance.value, member, mother)"
          />
        </div>
        @for (problem of problems(); track problem.key) {
          <div class="text-warning mb-1" [attr.data-testid]="'pool-problem-' + problem.key">
            <i class="fa fa-exclamation-triangle me-1"></i>{{ 'POOLS.PROBLEM_' + problem.key | translate: problem.params }}
          </div>
        }
        <div class="d-flex gap-1">
          <button type="button" class="btn btn-sm btn-outline-danger" data-testid="pool-leave" (click)="leave.emit()">
            {{ (count() > 1 ? 'WORLD_EDITOR.POOL_LEAVE_ALL' : 'WORLD_EDITOR.POOL_LEAVE') | translate: { count: count() } }}
          </button>
          @if (canOpen()) {
            <button type="button" class="btn btn-sm btn-outline-secondary" data-testid="pool-open" (click)="open.emit(member.pool)">
              {{ 'WORLD_EDITOR.POOL_OPEN' | translate }}
            </button>
          }
        </div>
      } @else {
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text">{{ 'WORLD_EDITOR.POOL_ADD_TO' | translate }}</span>
          <input #pool type="number" min="1" class="form-control" data-testid="pool-join-id" placeholder="pool_entry" />
          <input #chance type="number" min="0" max="100" step="any" class="form-control" data-testid="pool-join-chance" placeholder="%" />
          <button type="button" class="btn btn-outline-primary" data-testid="pool-join" (click)="joinPool(pool.value, chance.value)">
            {{ 'WORLD_EDITOR.POOL_ADD' | translate: { count: count() } }}
          </button>
        </div>
        <div class="input-group input-group-sm">
          <span class="input-group-text">{{ 'WORLD_EDITOR.POOL_NEW' | translate }}</span>
          <input #max type="number" min="0" class="form-control" data-testid="pool-new-max" placeholder="max_limit" value="1" />
          <input #description class="form-control w-25" data-testid="pool-new-description" [placeholder]="'description'" />
          <button
            type="button"
            class="btn btn-outline-primary"
            data-testid="pool-create"
            (click)="createPool(max.value, description.value)"
          >
            {{ 'WORLD_EDITOR.POOL_CREATE' | translate: { count: count() } }}
          </button>
        </div>
      }
    </div>
  `,
})
export class PoolPanelComponent {
  /** The selected spawn's pool (undefined: none). */
  readonly member = input<PoolMember | undefined>();
  /** How many spawns are selected (the panel acts on all of them). */
  readonly count = input(1);
  /** Whether the Pool Editor can be opened from here. */
  readonly canOpen = input(false);
  /** What the world server will say about the pool's chances. */
  readonly problems = input<PoolProblem[]>([]);
  readonly template = output<{ maxLimit: number; description: string }>();
  readonly mother = output<{ mother: number | null; chance: number }>();
  readonly chance = output<number>();
  readonly leave = output<void>();
  readonly join = output<{ pool: number; chance: number }>();
  readonly create = output<{ maxLimit: number; description: string }>();
  readonly open = output<number>();

  protected setChance(event: Event, current: number): void {
    const element = event.target as HTMLInputElement;
    const value = Number(element.value);
    if (element.value === '' || !(value >= 0 && value <= 100)) {
      element.value = String(current);
      return;
    }
    this.chance.emit(value);
  }

  protected editPool(max: string, description: string, member: PoolMember): void {
    const maxLimit = Math.trunc(Number(max));
    if (max.trim() !== '' && maxLimit >= 0) {
      this.template.emit({ maxLimit, description: description.trim() });
    } else {
      this.template.emit({ maxLimit: member.maxLimit, description: description.trim() });
    }
  }

  /** Puts the pool in a mother pool (an empty one: in none). */
  protected setMother(mother: string, chance: string, member: PoolMember, input: HTMLInputElement): void {
    const id = Math.trunc(Number(mother));
    const value = Number(chance || 0);
    if (mother.trim() === '') {
      this.mother.emit({ mother: null, chance: 0 });
    } else if (id === member.pool) {
      // (a pool in itself: the world server skips it)
      input.value = member.mother === null ? '' : String(member.mother);
    } else if (id > 0 && value >= 0 && value <= 100) {
      this.mother.emit({ mother: id, chance: value });
    }
  }

  protected joinPool(pool: string, chance: string): void {
    const id = Math.trunc(Number(pool));
    const value = Number(chance || 0);
    if (id > 0 && value >= 0 && value <= 100) {
      this.join.emit({ pool: id, chance: value });
    }
  }

  protected createPool(max: string, description: string): void {
    const maxLimit = Math.trunc(Number(max || 0));
    if (maxLimit >= 0) {
      this.create.emit({ maxLimit, description: description.trim() });
    }
  }
}
