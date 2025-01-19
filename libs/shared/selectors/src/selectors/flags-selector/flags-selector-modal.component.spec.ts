import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { FlagsService } from './flags.service';
import { Flag } from '@keira/shared/constants';
import { TranslateTestingModule } from '@keira/shared/test-utils';

describe('FlagsSelectorModalComponent', () => {
  let component: FlagsSelectorModalComponent;
  let fixture: ComponentFixture<FlagsSelectorModalComponent>;
  let flagsService: FlagsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FlagsSelectorModalComponent, TranslateTestingModule],
      providers: [BsModalRef],
    }).compileComponents();
  }));

  beforeEach(() => {
    flagsService = TestBed.inject(FlagsService);

    fixture = TestBed.createComponent(FlagsSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should safely create without config', () => {
    expect(component).toBeTruthy();
  });

  it('should properly handle config (if any)', () => {
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
    const value = 123456;
    const overrideDefaultBehavior = true;
    const flags = [{ bit: 1, name: 'flag-1' }];
    const initialFlagValues = [true, false, true];
    const updatedValue = 654321;

    // Set up the component's initial state
    component.value = value;
    component.config = { name: 'Mock Modal Name', flags, overrideDefaultBehavior };
    component.flagValues = [...initialFlagValues];

    // Spy on the flagsService.getValueFromBits method
    const spyGetValueFromBits = spyOn(flagsService, 'getValueFromBits').and.returnValue(updatedValue);

    // Act: Call toggleBit with a specific bit index
    component.toggleBit(1); // Toggle the second bit (index 1)

    // Assertions
    expect(component.flagValues).toEqual([true, true, true]); // Bit at index 1 should toggle to `true`
    expect(spyGetValueFromBits).toHaveBeenCalledTimes(1);
    expect(spyGetValueFromBits).toHaveBeenCalledWith([true, true, true], overrideDefaultBehavior);
    expect(component.value).toEqual(updatedValue); // Value should update based on the override behavior
  });
});
