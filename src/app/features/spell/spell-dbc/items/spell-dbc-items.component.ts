import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SPELL_DBC_INVENTORY_TYPE, SPELL_DBC_ITEM_SUBCLASS } from '@keira-shared/constants/flags/spell-dbc-item-flags';
import { ITEM_CLASS } from '@keira-shared/constants/options/item-class';
import { TOTEM_CATEGORY } from '@keira-shared/constants/options/totem-category';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
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
