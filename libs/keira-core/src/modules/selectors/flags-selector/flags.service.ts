import { Injectable } from '@angular/core';
import { Flag } from '@keira/shared-constants';

@Injectable({
  providedIn: 'root',
})
export class FlagsService {
  getBitsFromValue(value: number, bitsCount: number): boolean[] {
    const bits = new Array<boolean>(bitsCount);
    const binaryStr: string = value.toString(2).split('').reverse().join('');

    for (let i = 0; i < bitsCount; i++) {
      bits[i] = parseInt(binaryStr[i], 10) === 1;
    }

    return bits;
  }

  getValueFromBits(bits: boolean[]): number {
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
