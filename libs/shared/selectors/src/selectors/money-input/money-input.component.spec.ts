import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';

import { Coin } from './money';
import { MoneyInputComponent } from './money-input.component';

@Component({
  template: `<keira-money-input [control]="control" id="money" />`,
  imports: [MoneyInputComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(MoneyInputComponent);
  readonly control = new FormControl<number>(0);
}

class MoneyInputPage extends PageObject<TestHostComponent> {
  box(coin: Coin): HTMLInputElement {
    return this.query<HTMLInputElement>(`#money input.money-${coin}`);
  }

  boxes(): string[] {
    return (['gold', 'silver', 'copper'] as Coin[]).map((coin) => this.box(coin).value);
  }

  type(coin: Coin, text: string): void {
    const box = this.box(coin);
    box.value = text;
    box.dispatchEvent(new Event('input'));
    this.detectChanges();
  }

  leave(coin: Coin): void {
    this.box(coin).dispatchEvent(new Event('blur'));
    this.detectChanges();
  }
}

describe('MoneyInputComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  const setup = (value: number | null = 305016) => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.control.setValue(value);
    const page = new MoneyInputPage(fixture);
    page.detectChanges();
    return { host, page };
  };

  it('should split the stored copper into gold, silver and copper', () => {
    const { page } = setup();

    expect(page.boxes()).toEqual(['30', '50', '16']);
    expect(page.box('gold').getAttribute('aria-label')).toEqual('SELECTORS.MONEY.GOLD');
    expect(page.box('copper').title).toEqual('SELECTORS.MONEY.COPPER');
  });

  it('should show zero coins for an empty value', () => {
    const { page } = setup(null);

    expect(page.boxes()).toEqual(['0', '0', '0']);
  });

  it('should split the new value when the control is changed from outside', () => {
    const { host, page } = setup();

    host.control.setValue(193837);
    page.detectChanges();

    expect(page.boxes()).toEqual(['19', '38', '37']);
  });

  it('should update the copper total live while a box is edited', () => {
    const { host, page } = setup();

    page.type('gold', '21');
    expect(host.control.value).toEqual(215016);
    page.type('silver', '59');
    page.type('copper', '37');

    expect(host.control.value).toEqual(215937);
    expect(host.control.dirty).toBe(true);
    expect(page.boxes()).toEqual(['21', '59', '37']);
  });

  it('should drop non-digits as they are typed', () => {
    const { host, page } = setup(0);

    page.type('silver', '1a-2.');
    page.type('gold', '-3x');

    expect(page.box('silver').value).toEqual('12');
    expect(page.box('gold').value).toEqual('-3');
    expect(host.control.value).toEqual(-31200);
  });

  it('should keep the text as typed until the box loses focus', () => {
    const { host, page } = setup(10101);

    page.type('copper', '');
    expect(host.control.value).toEqual(10100);
    expect(page.box('copper').value).toEqual('');

    page.type('copper', '150');
    expect(host.control.value).toEqual(10250);
    expect(page.box('copper').value).toEqual('150');

    page.leave('copper');
    expect(page.boxes()).toEqual(['1', '2', '50']);
  });

  it('should count empty boxes as zero', () => {
    const { host, page } = setup();

    page.type('gold', '');
    page.type('silver', '');
    page.type('copper', '');
    expect(host.control.value).toEqual(0);

    page.leave('copper');
    expect(page.boxes()).toEqual(['0', '0', '0']);
  });

  it('should show and keep the sign of a negative amount', () => {
    const { host, page } = setup(-15000);

    expect(page.boxes()).toEqual(['-1', '50', '0']);

    page.type('silver', '25');
    expect(host.control.value).toEqual(-12500);

    page.type('gold', '-');
    page.type('silver', '0');
    expect(host.control.value).toEqual(0);

    page.leave('silver');
    expect(page.boxes()).toEqual(['0', '0', '0']);

    page.type('gold', '2');
    expect(host.control.value).toEqual(20000);
  });

  it('should show a negative amount under one gold with a signed gold box', () => {
    const { page } = setup(-5000);

    expect(page.boxes()).toEqual(['-0', '50', '0']);
  });

  it('should disable the boxes when the control is disabled', () => {
    const { host, page } = setup();

    host.control.disable();
    page.detectChanges();

    expect(page.box('gold').disabled).toBe(true);
    expect(page.box('silver').disabled).toBe(true);
    expect(page.box('copper').disabled).toBe(true);
  });
});
