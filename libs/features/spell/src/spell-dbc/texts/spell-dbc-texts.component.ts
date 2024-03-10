import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModelForm } from '@keira/shared/core';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { LOCALES } from './spell-dbc-texts.model';
import { TranslateModule } from '@ngx-translate/core';
import { SpellDbcLocaleComponent } from './spell-dbc-locale/spell-dbc-locale.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgIf, NgFor } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-texts',
  templateUrl: './spell-dbc-texts.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TooltipModule, NgIf, TabsModule, NgFor, SpellDbcLocaleComponent, TranslateModule],
})
export class SpellDbcTextsComponent {
  readonly LOCALES = LOCALES;
  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}
