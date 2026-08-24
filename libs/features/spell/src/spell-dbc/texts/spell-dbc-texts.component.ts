import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { LOCALES } from './spell-dbc-texts.model';
import { TranslatePipe } from '@ngx-translate/core';
import { SpellDbcLocaleComponent } from './spell-dbc-locale/spell-dbc-locale.component';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';

import { TooltipDirective } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-texts',
  templateUrl: './spell-dbc-texts.component.html',
  imports: [FormsModule, ReactiveFormsModule, TooltipDirective, TabsetComponent, TabDirective, SpellDbcLocaleComponent, TranslatePipe],
})
export class SpellDbcTextsComponent {
  readonly LOCALES = LOCALES;
  @Input({ required: true }) formGroup!: FormGroup<ModelForm<SpellDbc>>;
}
