import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateDirective } from '@ngx-translate/core';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { joinMoney, splitMoney, toInteger } from './money';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-money-selector-modal',
  templateUrl: './money-selector-modal.component.html',
  imports: [FormsModule, TranslateDirective],
})
export class MoneySelectorModalComponent extends BaseSelectorModalComponent implements OnInit {
  readonly gold = signal(0);
  readonly silver = signal(0);
  readonly copper = signal(0);

  // A negative amount is meaningful in some fields (e.g. a negative quest RewardMoney is the money the quest requires),
  // so the sign of the original value is kept and the coins only edit the amount.
  private readonly negative = signal(false);

  readonly total = computed(() => {
    const amount = joinMoney({ gold: this.gold(), silver: this.silver(), copper: this.copper() });
    return this.negative() && amount !== 0 ? -amount : amount;
  });

  ngOnInit(): void {
    const value = toInteger(this.value);
    const { gold, silver, copper } = splitMoney(value);
    this.negative.set(value < 0);
    this.gold.set(gold);
    this.silver.set(silver);
    this.copper.set(copper);
  }

  setCoin(coin: 'gold' | 'silver' | 'copper', value: unknown): void {
    this[coin].set(Math.max(0, toInteger(value)));
  }

  override onSave(): void {
    this.value = this.total();
    super.onSave();
  }
}
