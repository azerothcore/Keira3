import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SPELL_DBC_INVENTORY_TYPE, SPELL_DBC_ITEM_SUBCLASS } from '@keira/acore-world-model';
import { ITEM_CLASS } from '@keira/acore-world-model';
import { TOTEM_CATEGORY } from '@keira/acore-world-model';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-items',
  templateUrl: './spell-dbc-items.component.html',
})
export class SpellDbcItemsComponent {
  readonly ITEM_CLASS = ITEM_CLASS;
  readonly SPELL_DBC_ITEM_SUBCLASS = SPELL_DBC_ITEM_SUBCLASS;
  readonly SPELL_DBC_INVENTORY_TYPE = SPELL_DBC_INVENTORY_TYPE;
  readonly TOTEM_CATEGORY = TOTEM_CATEGORY;

  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}
