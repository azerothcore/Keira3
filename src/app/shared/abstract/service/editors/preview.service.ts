import { Injectable } from '@angular/core';
import { ITEM_CONSTANTS } from 'app/features/item/item-template/item-constants';
import { RACE } from 'app/features/item/item-template/item-preview';

@Injectable({ providedIn: 'root' })
export class PreviewService {
  private readonly ITEM_CONSTANTS = ITEM_CONSTANTS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
  ) { }

  public getFactionFromRace(raceMask: number): string {
    if (raceMask === RACE.MASK_HORDE) {
      return ITEM_CONSTANTS.ra['-2'];
    }

    if (raceMask === RACE.MASK_ALLIANCE) {
      return ITEM_CONSTANTS.ra['-1'];
    }

    return null;
  }

  public getRaceString(raceMask: number): string[] {
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

    const tmp  = [];
    let i = 1;
    while (raceMask) {
      if (raceMask & (1 << (i - 1))) {
        const tmpRace = ITEM_CONSTANTS.ra[i];
        /* istanbul ignore else */
        if (!!tmpRace) {
          tmp.push(tmpRace);
        }
        raceMask &= ~(1 << (i - 1));
      }
      i++;
    }

    return tmp;
  }

}
