import { Service } from '@angular/core';

@Service()
export class OptionsSelectorService {
  getValuesFromCsv(value: string | number | null | undefined): number[] {
    const ids = `${value ?? ''}`
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token !== '')
      .map((token) => Number(token))
      .filter((id) => Number.isInteger(id));

    return [...new Set(ids)].sort((a, b) => a - b);
  }

  getCsvFromValues(values: number[]): string {
    return [...new Set(values)].sort((a, b) => a - b).join(',');
  }
}
