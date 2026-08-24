import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SPELL_DBC_PROC_FLAGS, SPELL_DBC_TARGETS, SpellDbc } from '@keira/shared/acore-world-model';
import { ModelForm } from '@keira/shared/utils';
import { TranslatePipe } from '@ngx-translate/core';
import { SpellDbcSpellEffectComponent } from './spell-dbc-spell-effect/spell-dbc-spell-effect.component';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { FlagsSelectorBtnComponent } from '@keira/shared/selectors';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-effects',
  templateUrl: './spell-dbc-effects.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FlagsSelectorBtnComponent,
    TooltipDirective,
    TabsetComponent,
    TabDirective,
    SpellDbcSpellEffectComponent,
    TranslatePipe,
  ],
})
export class SpellDbcEffectsComponent {
  readonly SPELL_DBC_TARGETS = SPELL_DBC_TARGETS;
  readonly SPELL_DBC_PROC_FLAGS = SPELL_DBC_PROC_FLAGS;

  readonly formGroup = input.required<FormGroup<ModelForm<SpellDbc>>>();
}
