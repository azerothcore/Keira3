import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CreatureImmunities } from '@keira/shared/acore-world-model';
import { CreatureImmunitiesCommentService } from './creature-immunities-comment.service';

describe('CreatureImmunitiesCommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), CreatureImmunitiesCommentService],
    });
  });

  const setup = () => {
    const service = TestBed.inject(CreatureImmunitiesCommentService);
    return { service };
  };

  const getRow = (overrides: Partial<CreatureImmunities> = {}): CreatureImmunities => Object.assign(new CreatureImmunities(), overrides);

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  it('should return an empty string when nothing is set', () => {
    const { service } = setup();
    expect(service.generate(getRow())).toBe('');
  });

  it('should generate the comment of the row 368 [school + mechanics]', () => {
    const { service } = setup();
    const row = getRow({ ID: -368, SchoolMask: 127, MechanicsMask: 1301741246 });

    expect(service.generate(row)).toBe(
      'school=0x7F(NORMAL|HOLY|FIRE|NATURE|FROST|SHADOW|ARCANE), ' +
        'mech=0x26CB7F5F(CHARM|DISORIENTED|DISARM|DISTRACT|FEAR|ROOT|SILENCE|SLEEP|SNARE|STUN|FREEZE|KNOCKOUT|BLEED|' +
        'POLYMORPH|BANISH|SHACKLE|TURN|HORROR|INTERRUPT|DAZE|SAPPED)',
    );
  });

  it('should generate the comment of the row 380 [mechanics + effects + auras, never flags]', () => {
    const { service } = setup();
    const row = getRow({ ID: -380, MechanicsMask: 1770946302, Effects: '114', Auras: '11' });

    const comment = service.generate(row);

    expect(comment).toBe(
      'mech=0x34C73F7F(CHARM|DISORIENTED|DISARM|DISTRACT|FEAR|GRIP|ROOT|SILENCE|SLEEP|SNARE|STUN|FREEZE|KNOCKOUT|' +
        'POLYMORPH|BANISH|SHIELD|TURN|HORROR|DAZE|IMMUNE_SHIELD|SAPPED), effects=114(ATTACK_ME), auras=11(MOD_TAUNT)',
    );
    expect(comment).not.toContain('flags=');
  });

  it('should generate a school-only comment', () => {
    const { service } = setup();
    const row = getRow({ SchoolMask: 127 });

    expect(service.generate(row)).toBe('school=0x7F(NORMAL|HOLY|FIRE|NATURE|FROST|SHADOW|ARCANE)');
  });

  // 32-bit trap regression guard: bit 36 must survive
  it('should detect a mechanic bit above 31', () => {
    const { service } = setup();
    const row = getRow({ MechanicsMask: 2 ** 36 });

    expect(service.generate(row)).toBe('mech=0x800000000(TAUNTED)');
  });

  it('should render a bare hex when the mask holds no bit the list knows', () => {
    const { service } = setup();

    expect(service.generate(getRow({ SchoolMask: 128 }))).toBe('school=0x80');
    expect(service.generate(getRow({ MechanicsMask: 2 ** 40 }))).toBe('mech=0x8000000000');
  });

  it('should render multiple ids in ascending order', () => {
    const { service } = setup();
    const row = getRow({ Effects: '145, 98, 98 ', Auras: '11,5' });

    expect(service.generate(row)).toBe('effects=98(KNOCK_BACK),145(PULL_TOWARDS_DEST), auras=5(MOD_CONFUSE),11(MOD_TAUNT)');
  });

  it('should render an unknown id as a bare id', () => {
    const { service } = setup();
    const row = getRow({ Effects: '999', Auras: '1000' });

    expect(service.generate(row)).toBe('effects=999, auras=1000');
  });

  it('should render a dispel-only row without a dispel part', () => {
    const { service } = setup();
    const row = getRow({ DispelTypeMask: 1 });

    expect(service.generate(row)).toBe('');
  });
});
