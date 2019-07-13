import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap';
import { UiSwitchModule } from 'ngx-ui-switch';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { CommonTestModule } from '../../../../../test-utils/common-test.module';
import { FlagsService } from '../../../../../services/helpers/flags.service';

describe('FlagsSelectorModalComponent', () => {
  let component: FlagsSelectorModalComponent;
  let fixture: ComponentFixture<FlagsSelectorModalComponent>;
  let flagsService: FlagsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlagsSelectorModalComponent ],
      imports: [
        CommonTestModule,
        UiSwitchModule,
      ],
      providers: [
        BsModalRef,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    flagsService = TestBed.get(FlagsService);

    fixture = TestBed.createComponent(FlagsSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should safely create without config', () => {
    expect(component).toBeTruthy();
  });

  it('should properly handle config (if any)', () => {
    const bits = [false, true, false];
    const flags = 'mock flags';
    const value = 123;
    component.value = value;
    component.config = { flags };
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
