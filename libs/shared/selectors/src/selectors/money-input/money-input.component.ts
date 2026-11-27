import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { Coin, joinMoney, splitMoney, toInteger } from './money';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-money-input',
  templateUrl: './money-input.component.html',
  styleUrls: ['./money-input.component.scss'],
  imports: [TranslatePipe],
})
export class MoneyInputComponent implements OnInit {
  readonly control = input.required<FormControl>();

  private readonly destroyRef = inject(DestroyRef);

  protected readonly coins: readonly Coin[] = ['gold', 'silver', 'copper'];
  protected readonly labels: Record<Coin, string> = {
    gold: 'SELECTORS.MONEY.GOLD',
    silver: 'SELECTORS.MONEY.SILVER',
    copper: 'SELECTORS.MONEY.COPPER',
  };

  // Text shown in each box, kept as typed until the box loses focus so that clearing a box or typing "150" isn't rewritten mid-edit.
  readonly gold = signal('0');
  readonly silver = signal('0');
  readonly copper = signal('0');
  readonly disabled = signal(false);

  // A negative amount is meaningful in some fields (e.g. a negative quest RewardMoney is the money the quest requires).
  // It is entered as a leading "-" in the gold box and applies to the whole amount.
  private negative = false;
  private lastEmitted: number | undefined;

  ngOnInit(): void {
    const control = this.control();
    this.showValue(control.value);
    this.disabled.set(control.disabled);
    control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.disabled.set(control.disabled));
    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value !== this.lastEmitted) {
        this.showValue(value);
      }
    });
  }

  onInput(coin: Coin, box: HTMLInputElement): void {
    const allowSign = coin === 'gold';
    const text = box.value.replace(allowSign ? /(?!^-)\D/g : /\D/g, '');
    if (text !== box.value) {
      box.value = text;
    }
    if (allowSign) {
      this.negative = text.startsWith('-');
    }
    this[coin].set(text);

    const amount = joinMoney({
      gold: Math.abs(toInteger(this.gold())),
      silver: toInteger(this.silver()),
      copper: toInteger(this.copper()),
    });
    this.lastEmitted = this.negative && amount !== 0 ? -amount : amount;
    this.control().setValue(this.lastEmitted);
    this.control().markAsDirty();
  }

  onBlur(): void {
    this.lastEmitted = undefined;
    this.showValue(this.control().value);
  }

  private showValue(value: unknown): void {
    const total = toInteger(value);
    const { gold, silver, copper } = splitMoney(total);
    this.negative = total < 0;
    this.gold.set(`${this.negative ? '-' : ''}${gold}`);
    this.silver.set(`${silver}`);
    this.copper.set(`${copper}`);
  }
}
