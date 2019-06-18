import { TestBed } from '@angular/core/testing';

import { FlagsService } from './flags.service';

fdescribe('FlagsService', () => {
  let service: FlagsService;

  beforeEach(() => TestBed.configureTestingModule({}));

  beforeEach(() => {
    service = TestBed.get(FlagsService);
  });

  describe('getBitsFromValue', () => {
    it('it should return all 1s when the value is -1', () => {
      expect(service.getBitsFromValue(-1, 3)).toEqual([true, true, true]);
    });

    function toInt(binary: string) { return parseInt(binary, 2); }

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
        expect(service.getBitsFromValue(value, count)).toEqual(expected);
      });
    }
  });

  describe('getValueFromBits', () => {
    // TODO
  });
});
