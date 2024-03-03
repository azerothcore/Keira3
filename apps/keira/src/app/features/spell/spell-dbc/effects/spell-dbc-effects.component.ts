import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SPELL_DBC_PROC_FLAGS, SPELL_DBC_TARGETS } from '@keira/acore-world-model';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-effects',
  templateUrl: './spell-dbc-effects.component.html',
})
export class SpellDbcEffectsComponent {
  readonly SPELL_DBC_TARGETS = SPELL_DBC_TARGETS;
  readonly SPELL_DBC_PROC_FLAGS = SPELL_DBC_PROC_FLAGS;

  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}
