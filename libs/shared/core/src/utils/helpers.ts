import { FormControl, FormGroup } from '@angular/forms';

export type ModelForm<T> = {
  [K in keyof T]: FormControl<T[K]>;
};

export type ModelNestedForm<T> = {
  [K in keyof T]: FormControl<T[K]> | FormGroup<ModelForm<T[K]>>;
};

// if value is a string that holds a number, return it as a number
export function getNumberOrString(value: string | number): string | number {
  const number = Number.parseInt(`${value}`, 10);
  return `${number}` === `${value}` ? number : value;
}

export function getPartial<T>(input: T | Partial<T>, fields: string[]): Partial<T> {
  const output: Partial<T> = {};

  for (const key of fields) {
    output[`${key}`] = input[`${key}`];
  }

  return output;
}

/* istanbul ignore next */ // TODO: fix coverage
export function getEnumKeys(enumInput: { [s: number]: string }): number[] {
  return Object.keys(enumInput)
    .filter((k) => !isNaN(Number(k)))
    .map((k) => +k);
}

export const compareObjFn = (a: object, b: object) => JSON.stringify(a) === JSON.stringify(b);
