import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { DebugHtmlElement } from 'ngx-page-object-model';
import { joinMoney, Money, MoneyInputComponent, splitMoney } from './money-input.component';

class MoneyInputPage extends PageObject<MoneyInputComponent> {
  unit(unit: keyof Money): DebugHtmlElement<HTMLInputElement> {
    return this.getDebugElementByTestId(`money-${unit}`);
  }
  value(unit: keyof Money): string {
    return this.unit(unit).nativeElement.value;
  }
  sign(assert = true): DebugHtmlElement<HTMLSpanElement> {
    return this.getDebugElementByCss('.money-sign', assert);
  }
  type(unit: keyof Money, value: string): void {
    const input = this.unit(unit).nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('change'));
    this.fixture.detectChanges();
  }
}

describe(MoneyInputComponent.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MoneyInputComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection()],
    });
  });

  const setup = (value: number) => {
    const control = new FormControl<number>(value, { nonNullable: true });
    const page = new MoneyInputPage(TestBed.createComponent(MoneyInputComponent));
    page.fixture.componentRef.setInput('control', control);
    page.fixture.detectChanges();
    return { page, control };
  };

  it('splits and joins copper amounts', () => {
    expect(splitMoney(193837)).toEqual({ gold: 19, silver: 38, copper: 37 });
    expect(splitMoney(NaN)).toEqual({ gold: 0, silver: 0, copper: 0 });
    expect(joinMoney({ gold: 21, silver: 59, copper: 37 })).toBe(215937);
  });

  it('shows the field in gold, silver and copper, following its changes', () => {
    const { page, control } = setup(193837);

    expect([page.value('gold'), page.value('silver'), page.value('copper')]).toEqual(['19', '38', '37']);
    expect(page.sign(false)).toBeFalsy();

    control.setValue(5);
    page.fixture.detectChanges();
    expect([page.value('gold'), page.value('silver'), page.value('copper')]).toEqual(['0', '0', '5']);
  });

  it('changes the field when a unit is changed', () => {
    const { page, control } = setup(193837);

    page.type('silver', '59');
    page.type('gold', '21');

    expect(control.value).toBe(215937);
    expect(control.dirty).toBe(true);
    page.type('copper', 'x');
    expect(control.value).toBe(215900);
  });

  it('carries 100 silver into a gold, and shows it', () => {
    const { page, control } = setup(0);

    page.type('silver', '100');

    expect(control.value).toBe(10000);
    expect([page.value('gold'), page.value('silver'), page.value('copper')]).toEqual(['1', '0', '0']);
    page.type('copper', 'abc');
    expect(page.value('copper')).toBe('0');
  });

  it('keeps the sign of a negative amount', () => {
    const { page, control } = setup(-250);

    expect(page.sign()).toBeTruthy();
    expect(page.value('silver')).toBe('2');

    page.type('silver', '3');
    expect(control.value).toBe(-350);
  });

  it('is disabled with the field', () => {
    const { page, control } = setup(1);
    control.disable();
    page.fixture.detectChanges();

    expect(page.unit('gold').nativeElement.disabled).toBe(true);
  });
});
