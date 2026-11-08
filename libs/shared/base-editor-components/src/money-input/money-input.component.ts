import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { startWith } from 'rxjs';

/** A copper amount split in gold, silver and copper (1 gold = 100 silver = 10000 copper). */
export interface Money {
  gold: number;
  silver: number;
  copper: number;
}

export function splitMoney(value: number): Money {
  const copper = Math.abs(Math.trunc(Number(value) || 0));
  return { gold: Math.floor(copper / 10000), silver: Math.floor(copper / 100) % 100, copper: copper % 100 };
}

export const joinMoney = (money: Money): number => money.gold * 10000 + money.silver * 100 + money.copper;

/**
 * The gold, silver and copper of a money field (in copper), each one editable: what's typed changes the field. A
 * negative amount (the money a quest takes) keeps its sign.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-money-input',
  templateUrl: './money-input.component.html',
  styleUrls: ['./money-input.component.scss'],
  imports: [TranslatePipe],
})
export class MoneyInputComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly control = input.required<FormControl<number>>();

  protected readonly money = signal<Money>({ gold: 0, silver: 0, copper: 0 });
  protected readonly negative = signal(false);
  protected readonly units: (keyof Money)[] = ['gold', 'silver', 'copper'];

  ngOnInit(): void {
    this.control()
      .valueChanges.pipe(startWith(this.control().value), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.money.set(splitMoney(value));
        this.negative.set(Number(value) < 0);
      });
  }

  protected change(unit: keyof Money, input: HTMLInputElement): void {
    const amount = Math.max(0, Math.trunc(Number(input.value) || 0));
    const copper = joinMoney({ ...this.money(), [unit]: amount });
    const control = this.control();
    control.setValue(this.negative() ? -copper : copper);
    control.markAsDirty();
    // (100 silver is 1 gold, "abc" is 0: the box shows what the field now holds, even when its binding didn't change)
    input.value = String(this.money()[unit]);
  }
}
