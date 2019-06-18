import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FlagsService {

  getBitsFromValue(value: number, bitsCount: number): boolean[] {
    const bits = new Array<boolean>(bitsCount);

    if (value === -1) {
      for (let i = 0; i < bitsCount; i++) { bits[i] = true; }
      return bits;
    }

    const binaryStr: string = value.toString(2).split('').reverse().join('');

    for (let i = 0; i < bitsCount; i++)  {
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
}
