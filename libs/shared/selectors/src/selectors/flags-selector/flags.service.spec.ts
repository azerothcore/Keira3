import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { FlagsService } from './flags.service';
import { Flag } from '@keira/shared/constants';

describe('FlagsService', () => {
  const toInt = (binary: string) => parseInt(binary, 2);

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }),
  );

  describe('getBitsFromValue', () => {
    for (const { id, value, count, expected } of [
      { id: 1, value: 1, count: 1, expected: [true] },
      { id: 2, value: 1, count: 2, expected: [true, false] },
      { id: 3, value: 2, count: 3, expected: [false, true, false] },
      { id: 4, value: toInt('110'), count: 3, expected: [false, true, true] },
      { id: 5, value: toInt('110'), count: 4, expected: [false, true, true, false] },
      { id: 6, value: toInt('0110'), count: 5, expected: [false, true, true, false, false] },
      { id: 7, value: toInt('01010'), count: 5, expected: [false, true, false, true, false] },
    ]) {
      it(`it should correctly work [${id}]`, () => {
        const service = TestBed.inject(FlagsService);
        expect(service.getBitsFromValue(value, count)).toEqual(expected);
      });
    }
  });

  describe('getValueFromBits', () => {
    for (const { id, bits, expected } of [
      { id: 1, bits: [true, true, true], expected: 7 },
      { id: 2, bits: [true, false], expected: 1 },
      { id: 3, bits: [false, true, false], expected: 2 },
      { id: 4, bits: [false, true, true], expected: toInt('110') },
      { id: 5, bits: [false, true, true, false], expected: toInt('110') },
      { id: 6, bits: [false, true, true, false, false], expected: toInt('0110') },
      { id: 7, bits: [false, true, false, true, false], expected: toInt('01010') },
    ]) {
      it(`it should correctly work [${id}]`, () => {
        const service = TestBed.inject(FlagsService);
        expect(service.getValueFromBits(bits)).toEqual(expected);
      });
    }
  });

  describe('combining getValueFromBits and getBitsFromValue', () => {
    for (const v of [1, 5, 23, 40, 123, 231, 563, 2356, 8345, 9003]) {
      it(`value: ${v}`, () => {
        const service = TestBed.inject(FlagsService);
        expect(service.getValueFromBits(service.getBitsFromValue(v, 24))).toEqual(v);
      });
    }
  });

  it('getBitsArray() should correctly work', () => {
    const service = TestBed.inject(FlagsService);
    const mockResult = [true, false, true];
    const value = 123;
    const flags: Flag[] = [{ bit: 1, name: 'test' }];
    const getBitsFromValueSpy = spyOn(service, 'getBitsFromValue').and.returnValue(mockResult);

    expect(service.getBitsArray(flags, value)).toEqual(mockResult);
    expect(getBitsFromValueSpy).toHaveBeenCalledWith(value, flags[0].bit + 1);
  });

  it('should handle value -1 (all bits not set)', () => {
    const service = TestBed.inject(FlagsService);
    expect(service.getBitsFromValue(-1, 5)).toEqual([false, false, false, false, false]);
  });

  it('should handle value 0 (all bits unset)', () => {
    const service = TestBed.inject(FlagsService);
    expect(service.getBitsFromValue(0, 3)).toEqual([false, false, false]);
  });

  it('should handle count 0 (empty bits array)', () => {
    const service = TestBed.inject(FlagsService);
    expect(service.getBitsFromValue(5, 0)).toEqual([]);
  });

  it('should return -1 when overrideDefaultBehavior is true and all bits are false', () => {
    const service = TestBed.inject(FlagsService);
    expect(service.getValueFromBits([false, false, false], true)).toEqual(-1);
  });

  it('should return 0 when overrideDefaultBehavior is false and all bits are false', () => {
    const service = TestBed.inject(FlagsService);
    expect(service.getValueFromBits([false, false, false], false)).toEqual(0);
  });
});
