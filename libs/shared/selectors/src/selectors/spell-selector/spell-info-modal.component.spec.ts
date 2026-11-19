import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { SpellInfo, WowClientService } from '@keira/shared/wow-data';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { schoolNames, SpellInfoModalComponent, timeText } from './spell-info-modal.component';

class SpellInfoPage extends PageObject<SpellInfoModalComponent> {
  text(selector: string): string {
    return this.query<HTMLElement>(selector).textContent ?? '';
  }
}

const fireball: SpellInfo = {
  id: 133,
  name: 'Fireball',
  rank: 'Rank 1',
  schoolMask: 4,
  powerType: 0,
  manaCost: 30,
  manaCostPercentage: 0,
  castTime: 1500,
  duration: 8000,
  cooldown: 0,
  categoryCooldown: 0,
  rangeMin: 0,
  rangeMax: 35,
  speed: 24,
  stackAmount: 0,
  procChance: 101,
  procCharges: 0,
  maxAffectedTargets: 0,
  spellLevel: 1,
  maxLevel: 0,
  effects: [
    {
      index: 0,
      effect: 2,
      effectName: 'SCHOOL_DAMAGE',
      aura: 0,
      auraName: '',
      min: 14,
      max: 20,
      targetA: 'UNIT_TARGET_ENEMY',
      targetB: '',
      radius: 0,
      amplitude: 0,
      chainTargets: 0,
      item: 0,
      miscValue: 0,
      miscValueB: 0,
      triggerSpell: 0,
    },
    {
      index: 1,
      effect: 6,
      effectName: 'APPLY_AURA',
      aura: 3,
      auraName: 'PERIODIC_DAMAGE',
      min: 2,
      max: 2,
      targetA: 'UNIT_TARGET_ENEMY',
      targetB: 'UNIT_DEST_AREA_ENEMY',
      radius: 5,
      amplitude: 2000,
      chainTargets: 3,
      item: 7,
      miscValue: 1,
      miscValueB: 2,
      triggerSpell: 99,
    },
  ],
};

describe(SpellInfoModalComponent.name, () => {
  const setup = async (getSpellInfo: () => Promise<SpellInfo | undefined>) => {
    const hide = vi.fn();
    TestBed.configureTestingModule({
      imports: [SpellInfoModalComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BsModalRef, useValue: { hide } },
        { provide: WowClientService, useValue: { getSpellInfo: vi.fn(getSpellInfo) } },
      ],
    });
    const fixture = TestBed.createComponent(SpellInfoModalComponent);
    fixture.componentInstance.spellId = 133;
    const page = new SpellInfoPage(fixture);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { page, hide };
  };

  it('shows what the spell costs, takes, lasts and does', async () => {
    const { page, hide } = await setup(() => Promise.resolve(fireball));

    expect(page.text('#spell-info-title')).toContain('Fireball');
    expect(page.text('#spell-info-title')).toContain('Rank 1');
    const props = page.text('#spell-info-props');
    expect(props).toContain('Fire');
    expect(props).toContain('30 mana');
    expect(props).toContain('1.5 s');
    expect(props).toContain('8 s');
    expect(props).toContain('35 yd');
    const effects = page.text('#spell-info-effects');
    expect(effects).toContain('14–20');
    expect(effects).toContain('PERIODIC_DAMAGE');
    expect(effects).toContain('UNIT_DEST_AREA_ENEMY');
    expect(effects).toContain('99');
    expect(effects).toContain('misc 1 / 2');

    page.query<HTMLButtonElement>('#spell-info-close').click();
    expect(hide).toHaveBeenCalled();
  });

  it('shows the less common properties, and a spell without effects', async () => {
    const { page } = await setup(() =>
      Promise.resolve({
        ...fireball,
        rank: '',
        powerType: 1,
        manaCostPercentage: 10,
        castTime: 0,
        duration: -1,
        cooldown: 120000,
        categoryCooldown: 30000,
        rangeMin: 8,
        procChance: 20,
        procCharges: 2,
        stackAmount: 5,
        maxAffectedTargets: 3,
        effects: [],
      }),
    );

    const props = page.text('#spell-info-props');
    expect(props).toContain('10% rage');
    expect(props).toContain('SPELL_INFO.INSTANT');
    expect(props).toContain('∞');
    expect(props).toContain('2 min');
    expect(props).toContain('30 s');
    expect(props).toContain('8–35');
    expect(props).toContain('20%, 2 charges');
    expect(props).toContain('5');
    expect(page.text('#spell-info-effects')).toContain('-');
  });

  it('says when the client has no such spell, or fails', async () => {
    expect((await setup(() => Promise.resolve(undefined))).page.query('#spell-info-none')).toBeTruthy();
    TestBed.resetTestingModule();
    expect((await setup(() => Promise.reject(new Error('no client')))).page.text('#spell-info-error')).toContain('no client');
    TestBed.resetTestingModule();
    expect((await setup(() => Promise.reject('down'))).page.text('#spell-info-error')).toContain('down');
  });

  it('writes schools, costs and times in words', async () => {
    expect(schoolNames(0)).toBe('');
    expect(schoolNames(0x7f)).toBe('Physical, Holy, Fire, Nature, Frost, Shadow, Arcane');
    expect(timeText(250)).toBe('0.25 s');
    const { page } = await setup(() => Promise.resolve({ ...fireball, powerType: 9, manaCost: 0 }));
    expect(page.text('#spell-info-props')).toContain('-');
    TestBed.resetTestingModule();
    const other = await setup(() => Promise.resolve({ ...fireball, powerType: 9, manaCost: 5 }));
    expect(other.page.text('#spell-info-props')).toContain('5 power 9');
  });
});
