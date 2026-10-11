import { Service, inject } from '@angular/core';
import {
  CreatureImmunities,
  MECHANIC_IMMUNITIES_MASK,
  SPELL_DBC_APPLY_AURA_NAME,
  SPELL_DBC_EFFECT,
  SPELL_SCHOOL_MASK,
} from '@keira/shared/acore-world-model';
import { Flag, Option } from '@keira/shared/constants';
import { FlagsService, OptionsSelectorService } from '@keira/shared/selectors';

/**
 * Rebuilds the Comment field of a `creature_immunities` row from its mask and CSV columns.
 *
 * The `mech=` hex is the stored mask halved: `Math.floor(mask / 2)`, never `mask >> 1`, which drops bits above 31.
 */
@Service()
export class CreatureImmunitiesCommentService {
  private readonly flagsService = inject(FlagsService);
  private readonly optionsSelectorService = inject(OptionsSelectorService);

  generate(row: CreatureImmunities): string {
    const parts: string[] = [];

    if (row.SchoolMask) {
      const names = this.getSetFlagNames(SPELL_SCHOOL_MASK, row.SchoolMask);
      parts.push(this.renderMaskPart('school', row.SchoolMask.toString(16).toUpperCase(), names));
    }

    if (row.MechanicsMask) {
      const hex = Math.floor(row.MechanicsMask / 2)
        .toString(16)
        .toUpperCase();
      const names = this.getSetFlagNames(MECHANIC_IMMUNITIES_MASK, row.MechanicsMask);
      parts.push(this.renderMaskPart('mech', hex, names));
    }

    const effects = this.getOptionsPart('effects', SPELL_DBC_EFFECT, row.Effects);
    if (effects) {
      parts.push(effects);
    }

    const auras = this.getOptionsPart('auras', SPELL_DBC_APPLY_AURA_NAME, row.Auras);
    if (auras) {
      parts.push(auras);
    }

    return parts.join(', ');
  }

  private renderMaskPart(label: string, hex: string, names: string[]): string {
    // A mask carrying only bits the list does not know is printed as the bare hex rather than as empty brackets.
    return names.length ? `${label}=0x${hex}(${names.join('|')})` : `${label}=0x${hex}`;
  }

  private getOptionsPart(label: string, options: Option[], csv: string): string {
    const values = this.optionsSelectorService.getValuesFromCsv(csv);
    if (!values.length) {
      return '';
    }

    return `${label}=${values.map((value) => this.renderOption(options, value)).join(',')}`;
  }

  private renderOption(options: Option[], value: number): string {
    const option = options.find((candidate) => Number(candidate.value) === value);
    // An id the list does not know is emitted as the bare id rather than dropped: the core skips such a token anyway.
    return option ? `${value}(${this.normalizeName(option.name)})` : `${value}`;
  }

  private getSetFlagNames(flags: Flag[], mask: number): string[] {
    const bits = this.flagsService.getBitsArray(flags, Number(mask));
    return flags.filter((flag) => bits[flag.bit]).map((flag) => this.normalizeName(flag.name));
  }

  private normalizeName(name: string): string {
    return name.replace(/^SPELL_(?:AURA|EFFECT|SCHOOL)_/, '').split(' ')[0];
  }
}
