
// if value is a string that holds a number, return it as a number
export function getNumberOrString(value: string|number): string|number {
  const number = Number.parseInt(`${value}`, 10);
  return `${number}` === `${value}` ? number : value;
}
