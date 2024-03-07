import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ITEM_CLASS, SPELL_DBC_INVENTORY_TYPE, SPELL_DBC_ITEM_SUBCLASS, SpellDbc, TOTEM_CATEGORY } from '@keira/shared/acore-world-model';
import { ModelForm } from '@keira/shared/core';
import { ItemSelectorBtnComponent } from '@keira/shared/core';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { NgIf, NgFor } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SingleValueSelectorBtnComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-items',
  templateUrl: './spell-dbc-items.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SingleValueSelectorBtnComponent,
    TooltipModule,
    NgIf,
    FlagsSelectorBtnComponent,
    ItemSelectorBtnComponent,
    NgFor,
  ],
})
export class SpellDbcItemsComponent {
  readonly ITEM_CLASS = ITEM_CLASS;
  readonly SPELL_DBC_ITEM_SUBCLASS = SPELL_DBC_ITEM_SUBCLASS;
  readonly SPELL_DBC_INVENTORY_TYPE = SPELL_DBC_INVENTORY_TYPE;
  readonly TOTEM_CATEGORY = TOTEM_CATEGORY;

  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}
