import { TestBed } from '@angular/core/testing';
import { PreviewHelperService } from './preview-helper.service';
import { RACE } from 'app/features/item/item-template/item-preview';
import { ITEM_CONSTANTS } from 'app/features/item/item-template/item-constants';

describe('PreviewHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function setup() {
    const service: PreviewHelperService = TestBed.inject(PreviewHelperService);
    return { service };
  }

  it('getFactionFromRace', () => {
    const { service } = setup();
    expect(service.getFactionFromRace(RACE.MASK_HORDE)).toBe(ITEM_CONSTANTS.ra['-2']);
    expect(service.getFactionFromRace(RACE.MASK_ALLIANCE)).toBe(ITEM_CONSTANTS.ra['-1']);
    expect(service.getFactionFromRace(0)).toBeNull();
  });

  it('getRaceString', () => {
    const { service } = setup();

    const mockRaces = 123;
    const resRaces = [ 'Human', 'Orc', 'Night Elf', 'Undead', 'Tauren', 'Gnome' ];
    expect(service.getRaceString(mockRaces)).toEqual(resRaces);

    const mockFaction = 'test';
    spyOn(service, 'getFactionFromRace').and.returnValue(mockFaction);
    expect(service.getRaceString(RACE.MASK_HORDE)).toEqual([mockFaction]);
  });

});
