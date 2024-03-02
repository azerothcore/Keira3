import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { FlagsService } from './flags.service';
import { FlagsSelectorModule } from './flags-selector.module';
import { Flag } from '@keira/acore-world-model';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';

describe('FlagsSelectorModalComponent', () => {
  let component: FlagsSelectorModalComponent;
  let fixture: ComponentFixture<FlagsSelectorModalComponent>;
  let flagsService: FlagsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FlagsSelectorModule, TranslateTestingModule],
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
    expect(spyGetValueFromBits).toHaveBeenCalledWith([true, true, true]);
    expect(component.value).toEqual(value);
  });
});
