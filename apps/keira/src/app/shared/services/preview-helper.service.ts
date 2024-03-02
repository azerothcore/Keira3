import { Injectable } from '@angular/core';
import { RACES_TEXT } from '@keira-shared/constants/preview';
import { CLASSES, RACE } from '../../features/item/item-template/item-preview';

@Injectable({ providedIn: 'root' })
export class PreviewHelperService {
  public formatMoney(qty: number): string {
    let money = '';

    if (qty >= 10000) {
      const g = Math.floor(qty / 10000);
      money += `<span class="moneygold">${g}</span> &nbsp;`;
      qty -= g * 10000;
    }

    if (qty >= 100) {
      const s = Math.floor(qty / 100);
      money += `<span class="moneysilver">${s}</span> &nbsp;`;
      qty -= s * 100;
    }

    money += `<span class="moneycopper">${qty}</span> &nbsp;`;

    return money;
  }

  public getFactionFromRace(raceMask: number): string {
    if (raceMask === RACE.MASK_HORDE) {
      return RACES_TEXT['-2'];
    }

    if (raceMask === RACE.MASK_ALLIANCE) {
      return RACES_TEXT['-1'];
    }

    return null;
  }

  public getRaceString(raceMask: number): any[] {
    // clamp to available races
    raceMask &= RACE.MASK_ALL;
    // available to all races (we don't display 'both factions')
    if (!raceMask || raceMask === RACE.MASK_ALL) {
      return null;
    }

    const faction = this.getFactionFromRace(raceMask);

    if (!!faction) {
      return [faction];
    }

    const tmp = [];
    let i = 1;
    while (raceMask) {
      if (raceMask & (1 << (i - 1))) {
        /* istanbul ignore else */
        if (!!i) {
          tmp.push(i);
        }
        raceMask &= ~(1 << (i - 1));
      }
      i++;
    }

    return tmp;
  }

  public getRequiredClass(classMask: number): number[] {
    classMask &= CLASSES.MASK_ALL; // clamp to available classes..

    if (classMask === CLASSES.MASK_ALL) {
      // available to all classes
      return null;
    }

    const tmp = [];
    let i = 1;
    while (classMask) {
      if (classMask & (1 << (i - 1))) {
        /* istanbul ignore else */
        if (!!i) {
          tmp.push(i);
        }

        classMask &= ~(1 << (i - 1));
      }
      i++;
    }

    return tmp;
  }
}
