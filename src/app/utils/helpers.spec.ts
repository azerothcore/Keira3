import { getNumberOrString } from './helpers';

describe('Helpers', () => {

  describe('getNumberOrString(value)', () => {
    for (const { id, value, expectedResult } of [
      { id: 1, value: '123', expectedResult: 123 },
      { id: 2, value: 123, expectedResult: 123 },
      { id: 3, value: '0123', expectedResult: '0123' },
      { id: 4, value: 'abc', expectedResult: 'abc' },
    ]) {
      it(`should correctly work [${id}]`, () => {
        expect(getNumberOrString(value)).toEqual(expectedResult);
      });
    }
  });

});
