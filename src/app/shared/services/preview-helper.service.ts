import { Injectable } from '@angular/core';
import { RACE } from 'app/features/item/item-template/item-preview';
import { RACES_TEXT } from '@keira-shared/constants/preview';

@Injectable({ providedIn: 'root' })
export class PreviewHelperService {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
  ) { }

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

    const tmp  = [];
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

}
