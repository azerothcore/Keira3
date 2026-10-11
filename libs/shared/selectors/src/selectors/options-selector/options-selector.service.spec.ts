import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { OptionsSelectorService } from './options-selector.service';

describe('OptionsSelectorService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }),
  );

  describe('getValuesFromCsv', () => {
    for (const { id, value, expected } of [
      { id: 1, value: ' 145, 98 ', expected: [98, 145] },
      { id: 2, value: '145,98,145', expected: [98, 145] },
      { id: 3, value: '98', expected: [98] },
      { id: 4, value: '1,,2,', expected: [1, 2] },
      { id: 5, value: '', expected: [] },
      { id: 6, value: null, expected: [] },
      { id: 7, value: undefined, expected: [] },
      { id: 8, value: 98, expected: [98] },
      { id: 9, value: '98,abc', expected: [98] },
      { id: 10, value: '98,1.5', expected: [98] },
    ] as { id: number; value: string | number | null | undefined; expected: number[] }[]) {
      it(`it should correctly work [${id}]`, () => {
        const service = TestBed.inject(OptionsSelectorService);
        expect(service.getValuesFromCsv(value)).toEqual(expected);
      });
    }
  });

  describe('getCsvFromValues', () => {
    for (const { id, values, expected } of [
      { id: 1, values: [145, 98], expected: '98,145' },
      { id: 2, values: [145, 98, 145], expected: '98,145' },
      { id: 3, values: [98], expected: '98' },
      { id: 4, values: [], expected: '' },
    ]) {
      it(`it should correctly work [${id}]`, () => {
        const service = TestBed.inject(OptionsSelectorService);
        expect(service.getCsvFromValues(values)).toEqual(expected);
      });
    }
  });

  it('getCsvFromValues() and getValuesFromCsv() should be inverse of each other', () => {
    const service = TestBed.inject(OptionsSelectorService);
    expect(service.getValuesFromCsv(service.getCsvFromValues([316, 5, 11, 11]))).toEqual([5, 11, 316]);
  });
});
