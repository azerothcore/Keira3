import { FormControl, FormGroup } from '@angular/forms';
import { Class } from '@keira-shared/types/general';

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

export function getEnumKeys(enumInput: { [s: number]: string }): number[] {
  return Object.keys(enumInput)
    .filter((k) => !isNaN(Number(k)))
    .map((k) => +k);
}

export function createMockObject(partial: Partial<Class>, c: Class) {
  return Object.assign(new c(), partial);
}
