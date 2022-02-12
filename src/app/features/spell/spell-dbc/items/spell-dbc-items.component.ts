import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { ITEM_CLASS } from '@keira-shared/constants/options/item-class';
import { TOTEM_CATEGORY } from '@keira-shared/constants/options/totem-category';
import { SPELL_DBC_ITEM_SUBCLASS, SPELL_DBC_INVENTORY_TYPE } from '@keira-shared/constants/flags/spell-dbc-item-flags';

@Component({
  selector: 'keira-spell-dbc-items',
  templateUrl: './spell-dbc-items.component.html',
})
export class SpellDbcItemsComponent {
  public readonly ITEM_CLASS = ITEM_CLASS;
  public readonly SPELL_DBC_ITEM_SUBCLASS = SPELL_DBC_ITEM_SUBCLASS;
  public readonly SPELL_DBC_INVENTORY_TYPE = SPELL_DBC_INVENTORY_TYPE;
  public readonly TOTEM_CATEGORY = TOTEM_CATEGORY;

  @Input() formGroup: FormGroup<SpellDbc>;
}
