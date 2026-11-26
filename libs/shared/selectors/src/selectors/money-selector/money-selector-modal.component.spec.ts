import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslateTestingModule } from '@keira/shared/test-utils';

import { MoneySelectorModalComponent } from './money-selector-modal.component';

describe('MoneySelectorModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MoneySelectorModalComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), BsModalRef],
    }).compileComponents();
  });

  async function setup(value: string | number, name = 'RewardMoney') {
    const fixture = TestBed.createComponent(MoneySelectorModalComponent);
    const component = fixture.componentInstance;
    component.value = value;
    component.config = { name };
    fixture.detectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const input = (coin: string) => host.querySelector<HTMLInputElement>(`#money-${coin}`) as HTMLInputElement;
    const total = () => host.querySelector('#money-total')?.textContent?.trim();
    const type = async (coin: string, text: string) => {
      input(coin).value = text;
      input(coin).dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, component, host, input, total, type };
  }

  it('should split the initial value into gold, silver and copper', async () => {
    const { host, input, total } = await setup(193837);

    expect(host.textContent).toContain('RewardMoney');
    expect(input('gold').value).toEqual('19');
    expect(input('silver').value).toEqual('38');
    expect(input('copper').value).toEqual('37');
    expect(total()).toEqual('193837');
  });

  it('should update the total when a coin changes', async () => {
    const { component, total, type } = await setup(193837);

    await type('silver', '59');
    await type('gold', '21');

    expect(component.total()).toEqual(215937);
    expect(total()).toEqual('215937');
  });

  it('should treat empty, negative and decimal coins as non-negative integers', async () => {
    const { component, type } = await setup(0);

    await type('gold', '');
    await type('silver', '-3');
    await type('copper', '7.8');

    expect(component.gold()).toEqual(0);
    expect(component.silver()).toEqual(0);
    expect(component.copper()).toEqual(7);
  });

  it('should keep the sign of a negative initial value', async () => {
    const { component, input, total, type } = await setup(-15000);

    expect(input('gold').value).toEqual('1');
    expect(input('silver').value).toEqual('50');
    expect(total()).toEqual('-15000');

    await type('gold', '2');
    expect(component.total()).toEqual(-25000);

    await type('gold', '0');
    await type('silver', '0');
    expect(component.total()).toEqual(0);
  });

  it('should handle a non-numeric initial value', async () => {
    const { component } = await setup('');
    expect(component.total()).toEqual(0);
  });

  it('should emit the total on save', async () => {
    const { component, host, type } = await setup(100);
    const hideSpy = vi.spyOn(TestBed.inject(BsModalRef), 'hide');
    const nextSpy = vi.spyOn(component.onValueSelected, 'next');

    await type('gold', '3');
    (host.querySelector('#modal-select-btn') as HTMLButtonElement).click();

    expect(nextSpy).toHaveBeenCalledWith(30100);
    expect(hideSpy).toHaveBeenCalledTimes(1);
  });

  it('should not emit on cancel', async () => {
    const { component, host } = await setup(100);
    const nextSpy = vi.spyOn(component.onValueSelected, 'next');

    (host.querySelector('#modal-cancel-btn') as HTMLButtonElement).click();

    expect(nextSpy).not.toHaveBeenCalled();
  });
});
