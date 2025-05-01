import { Injectable } from '@angular/core';
import { Flag } from '@keira/shared/constants';

@Injectable({
  providedIn: 'root',
})
export class FlagsService {
  getBitsFromValue(value: number, bitsCount: number): boolean[] {
    const bits = new Array<boolean>(bitsCount);
    const binaryStr: string = value !== -1 ? value.toString(2).split('').reverse().join('') : '0'.repeat(bitsCount);

    for (let i = 0; i < bitsCount; i++) {
      bits[i] = parseInt(binaryStr[i], 10) === 1;
    }

    return bits;
  }

  getValueFromBits(bits: boolean[], overrideDefaultBehavior: boolean = false): number {
    // override default behavior if all bits are false
    if (overrideDefaultBehavior && bits.every((bit) => !bit)) {
      return -1;
    }

    let result = 0;

    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        result += Math.pow(2, i);
      }
    }

    return result;
  }

  getBitsArray(flags: Flag[], value: number): boolean[] {
    let max = 0;

    for (const flag of flags) {
      /* istanbul ignore else */
      if (flag.bit > max) {
        max = flag.bit;
      }
    }

    return this.getBitsFromValue(value, max + 1);
  }
}
