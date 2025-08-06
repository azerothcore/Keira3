import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { FlagsService } from './flags.service';
import { Flag } from '@keira/shared/constants';
import { TranslateTestingModule } from '@keira/shared/test-utils';

describe('FlagsSelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlagsSelectorModalComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), BsModalRef],
    }).compileComponents();
  });

  function setup() {
    const flagsService = TestBed.inject(FlagsService);
    const fixture = TestBed.createComponent(FlagsSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return { flagsService, fixture, component };
  }

  it('should safely create without config', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should properly handle config (if any)', () => {
    const { component, flagsService } = setup();
    const bits = [false, true, false];
    const flags: Flag[] = [{ bit: 1, name: 'my-flag' }];
    const value = 123;
    component.value = value;
    component.config = { name: 'Mock Modal Name', flags };
    const getBitsArraySpy = spyOn(flagsService, 'getBitsArray').and.returnValue(bits);

    component.ngOnInit();

    expect(component.flagValues).toEqual(bits);
    expect(getBitsArraySpy).toHaveBeenCalledTimes(1);
    expect(getBitsArraySpy).toHaveBeenCalledWith(flags, value);
  });

  it('toogleBit() should properly work', () => {
    const { component, flagsService } = setup();
    const value = 123456;
    const spyGetValueFromBits = spyOn(flagsService, 'getValueFromBits').and.returnValue(value);
    component.flagValues = [true, false, true];

    component.toggleBit(1);

    expect(component.flagValues).toEqual([true, true, true]);
    expect(spyGetValueFromBits).toHaveBeenCalledTimes(1);
    expect(spyGetValueFromBits).toHaveBeenCalledWith([true, true, true], false);
    expect(component.value).toEqual(value);
  });

  it('toggleBit() override should properly work', () => {
    const { component, flagsService } = setup();
    const value = 123456;
    const overrideDefaultBehavior = true;
    const flags = [{ bit: 1, name: 'flag-1' }];
    const initialFlagValues = [true, false, true];
    const updatedValue = 654321;

    component.value = value;
    component.config = { name: 'Mock Modal Name', flags, overrideDefaultBehavior };
    component.flagValues = [...initialFlagValues];

    const spyGetValueFromBits = spyOn(flagsService, 'getValueFromBits').and.returnValue(updatedValue);

    component.toggleBit(1);

    expect(component.flagValues).toEqual([true, true, true]);
    expect(spyGetValueFromBits).toHaveBeenCalledTimes(1);
    expect(spyGetValueFromBits).toHaveBeenCalledWith([true, true, true], overrideDefaultBehavior);
    expect(component.value).toEqual(updatedValue);
  });
});
