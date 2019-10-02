
// if value is a string that holds a number, return it as a number
export function getNumberOrString(value: string|number): string|number {
  const number = Number.parseInt(`${value}`, 10);
  return `${number}` === `${value}` ? number : value;
}

export function getPartial<T>(input: T | Partial<T>, fields: string[]): Partial<T> {
  const output: Partial<T> = Object.keys(input)
  .filter(key => fields.includes(key))
  .reduce((obj, key) => {
    obj[key] = input[key];
    return obj;
  }, {});

  console.log(output);

  return output;
}

export function getEnumKeys(enumInput: { [s: number]: string }): number[] {
  return Object.keys(enumInput).filter((k) => !isNaN(Number(k))).map((k) => +k);
}
