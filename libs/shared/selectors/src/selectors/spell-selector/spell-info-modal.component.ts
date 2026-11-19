import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { SpellInfo, WowClientService } from '@keira/shared/wow-data';
import { TranslatePipe } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

const SCHOOLS = ['Physical', 'Holy', 'Fire', 'Nature', 'Frost', 'Shadow', 'Arcane'];
const POWERS: Record<number, string> = { 0: 'mana', 1: 'rage', 2: 'focus', 3: 'energy', 5: 'runes', 6: 'runic power', [-2]: 'health' };

/** The schools of a school mask, in words. */
export function schoolNames(mask: number): string {
  return SCHOOLS.filter((_, bit) => mask & (1 << bit)).join(', ');
}

/** A time in milliseconds, in words (−1 for infinite). */
export function timeText(ms: number): string {
  if (ms < 0) {
    return '∞';
  }
  if (ms < 60000) {
    return `${+(ms / 1000).toFixed(2)} s`;
  }
  return `${+(ms / 60000).toFixed(1)} min`;
}

/** What a spell does, read from the game client's Spell.dbc (SpellWork's idea): costs, times, range and effects. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-info-modal',
  imports: [TranslatePipe],
  template: `
    <div class="modal-header">
      <h5 class="modal-title" id="spell-info-title">
        @if (info(); as spell) {
          {{ spell.name }}
          @if (spell.rank) {
            <small class="text-muted">({{ spell.rank }})</small>
          }
          <small class="text-muted">#{{ spell.id }}</small>
        } @else {
          {{ 'SPELL_INFO.TITLE' | translate }} #{{ spellId }}
        }
      </h5>
      <button type="button" class="btn-close" id="spell-info-close" (click)="bsModalRef.hide()"></button>
    </div>
    <div class="modal-body small">
      @if (loading()) {
        <p>{{ 'LOADING' | translate }}</p>
      } @else if (error()) {
        <p class="text-danger" id="spell-info-error">{{ error() }}</p>
      } @else if (info(); as spell) {
        <dl class="row mb-2" id="spell-info-props">
          <dt class="col-4">{{ 'SPELL_INFO.SCHOOL' | translate }}</dt>
          <dd class="col-8">{{ schoolNames(spell.schoolMask) || '-' }}</dd>
          <dt class="col-4">{{ 'SPELL_INFO.COST' | translate }}</dt>
          <dd class="col-8">{{ cost(spell) }}</dd>
          <dt class="col-4">{{ 'SPELL_INFO.CAST_TIME' | translate }}</dt>
          <dd class="col-8">{{ spell.castTime ? timeText(spell.castTime) : ('SPELL_INFO.INSTANT' | translate) }}</dd>
          <dt class="col-4">{{ 'SPELL_INFO.DURATION' | translate }}</dt>
          <dd class="col-8">{{ spell.duration ? timeText(spell.duration) : '-' }}</dd>
          <dt class="col-4">{{ 'SPELL_INFO.RANGE' | translate }}</dt>
          <dd class="col-8">{{ spell.rangeMin ? spell.rangeMin + '–' : '' }}{{ spell.rangeMax }} yd</dd>
          <dt class="col-4">{{ 'SPELL_INFO.COOLDOWN' | translate }}</dt>
          <dd class="col-8">
            {{ spell.cooldown ? timeText(spell.cooldown) : '-' }}
            @if (spell.categoryCooldown) {
              ({{ 'SPELL_INFO.CATEGORY' | translate }} {{ timeText(spell.categoryCooldown) }})
            }
          </dd>
          @if (spell.procChance && spell.procChance !== 101) {
            <dt class="col-4">{{ 'SPELL_INFO.PROC' | translate }}</dt>
            <dd class="col-8">{{ spell.procChance }}%{{ spell.procCharges ? ', ' + spell.procCharges + ' charges' : '' }}</dd>
          }
          @if (spell.stackAmount) {
            <dt class="col-4">{{ 'SPELL_INFO.STACKS' | translate }}</dt>
            <dd class="col-8">{{ spell.stackAmount }}</dd>
          }
          @if (spell.maxAffectedTargets) {
            <dt class="col-4">{{ 'SPELL_INFO.MAX_TARGETS' | translate }}</dt>
            <dd class="col-8">{{ spell.maxAffectedTargets }}</dd>
          }
        </dl>
        <table class="table table-sm mb-0" id="spell-info-effects">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ 'SPELL_INFO.EFFECT' | translate }}</th>
              <th>{{ 'SPELL_INFO.VALUE' | translate }}</th>
              <th>{{ 'SPELL_INFO.TARGETS' | translate }}</th>
              <th>{{ 'SPELL_INFO.MORE' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (effect of spell.effects; track effect.index) {
              <tr>
                <td>{{ effect.index }}</td>
                <td>
                  {{ effect.effect }} {{ effect.effectName }}
                  @if (effect.aura) {
                    <br /><span class="text-muted">{{ effect.aura }} {{ effect.auraName }}</span>
                  }
                </td>
                <td>{{ effect.min === effect.max ? effect.min : effect.min + '–' + effect.max }}</td>
                <td>
                  {{ effect.targetA }}
                  @if (effect.targetB) {
                    <br />{{ effect.targetB }}
                  }
                </td>
                <td class="text-muted">
                  @if (effect.radius) {
                    {{ 'SPELL_INFO.RADIUS' | translate }} {{ effect.radius }} yd<br />
                  }
                  @if (effect.amplitude) {
                    {{ 'SPELL_INFO.EVERY' | translate }} {{ timeText(effect.amplitude) }}<br />
                  }
                  @if (effect.triggerSpell) {
                    {{ 'SPELL_INFO.TRIGGERS' | translate }} {{ effect.triggerSpell }}<br />
                  }
                  @if (effect.chainTargets) {
                    {{ 'SPELL_INFO.CHAIN' | translate }} {{ effect.chainTargets }}<br />
                  }
                  @if (effect.item) {
                    item {{ effect.item }}<br />
                  }
                  @if (effect.miscValue || effect.miscValueB) {
                    misc {{ effect.miscValue }}{{ effect.miscValueB ? ' / ' + effect.miscValueB : '' }}
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="text-muted">-</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p class="text-muted" id="spell-info-none">{{ 'SPELL_INFO.NONE' | translate }}</p>
      }
    </div>
  `,
})
export class SpellInfoModalComponent implements OnInit {
  protected readonly bsModalRef = inject(BsModalRef);
  private readonly client = inject(WowClientService);

  /** (given by the modal service) */
  spellId = 0;
  protected readonly info = signal<SpellInfo | undefined>(undefined);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly schoolNames = schoolNames;
  protected readonly timeText = timeText;

  async ngOnInit(): Promise<void> {
    try {
      this.info.set(await this.client.getSpellInfo(Number(this.spellId)));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error));
    }
    this.loading.set(false);
  }

  protected cost(spell: SpellInfo): string {
    const power = POWERS[spell.powerType] ?? `power ${spell.powerType}`;
    if (spell.manaCostPercentage) {
      return `${spell.manaCostPercentage}% ${power}`;
    }
    return spell.manaCost ? `${spell.manaCost} ${power}` : '-';
  }
}
