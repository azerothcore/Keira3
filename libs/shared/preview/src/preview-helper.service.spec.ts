import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RACES_TEXT } from '@keira/shared/constants';
import { PreviewHelperService, RACE } from './preview-helper.service';

describe('PreviewHelperService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }),
  );

  function setup() {
    const service: PreviewHelperService = TestBed.inject(PreviewHelperService);
    return { service };
  }

  it('getFactionFromRace', () => {
    const { service } = setup();
    expect(service.getFactionFromRace(RACE.MASK_HORDE)).toBe(RACES_TEXT['-2']);
    expect(service.getFactionFromRace(RACE.MASK_ALLIANCE)).toBe(RACES_TEXT['-1']);
    expect(service.getFactionFromRace(0)).toBeNull();
  });

  it('getRaceString', () => {
    const { service } = setup();

    const mockRaces = 123;
    const resRaces = ['Human', 'Orc', 'Night Elf', 'Undead', 'Tauren', 'Gnome'];
    expect(service.getRaceString(mockRaces)?.map((e: string | number) => RACES_TEXT[e as keyof typeof RACES_TEXT])).toEqual(resRaces);

    const mockFaction = 'test';
    vi.spyOn(service, 'getFactionFromRace').mockReturnValue(mockFaction);
    expect(service.getRaceString(RACE.MASK_HORDE)).toEqual([mockFaction]);
  });
});
