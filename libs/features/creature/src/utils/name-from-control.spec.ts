import { FormControl } from '@angular/forms';
import { vi } from 'vitest';
import { nameFromControl } from './name-from-control';

describe('nameFromControl', () => {
  function setup(initialValue: number, valueBeforeSubscribing?: number) {
    const control = new FormControl<number>(initialValue, { nonNullable: true });
    const getName = vi.fn((id: number) => Promise.resolve(`Name ${id}`));
    const names: (string | undefined)[] = [];
    const name$ = nameFromControl(control, getName);
    if (valueBeforeSubscribing !== undefined) {
      control.setValue(valueBeforeSubscribing);
    }
    const subscription = name$.subscribe((name) => names.push(name));
    return { control, getName, names, subscription };
  }

  it('emits the name of the initial value and of every new value', async () => {
    const { control, getName, names, subscription } = setup(17);
    await Promise.resolve();

    control.setValue(72);
    await Promise.resolve();

    expect(getName).toHaveBeenCalledTimes(2);
    expect(names).toEqual(['Name 17', 'Name 72']);
    subscription.unsubscribe();
  });

  it('does not look up empty values or repeated values', async () => {
    const { control, getName, names, subscription } = setup(0);
    control.setValue(5);
    control.setValue(5);
    await Promise.resolve();

    expect(getName).toHaveBeenCalledTimes(1);
    expect(names).toEqual([undefined, 'Name 5']);
    subscription.unsubscribe();
  });

  it('uses the value the control has when subscribing', async () => {
    const { getName, names, subscription } = setup(0, 120);
    await Promise.resolve();

    expect(getName).toHaveBeenCalledExactlyOnceWith(120);
    expect(names).toEqual(['Name 120']);
    subscription.unsubscribe();
  });
});
